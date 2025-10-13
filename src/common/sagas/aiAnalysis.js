import {takeLatest} from 'redux-saga';
import {call, put, select} from 'redux-saga/effects';
import {isString, uniqBy, flatten, map, trim, slice, sortBy} from 'lodash';
import {runAnalysisSuccess, runAnalysisFailure, RUN_ANALYSIS} from '../actions/aiAnalysis';
import {getEnabled} from '../selectors/tests';
import {getConfig as getAiConfig} from '../selectors/ai';
import {getAllTests, getAllCriteria, getVersion} from '../selectors/reference';
import {getPageTitle, getPageUrl} from '../selectors/panel';
import {getTestComment} from '../selectors/checklist';

const RESULT_VALUES = ['C', 'NC', 'NA'];

const sanitizeHtml = (value = '') => trim(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' '));

const parseJson = (value, fallback) => {
        if (!value || !isString(value)) {
                return fallback;
        }

        try {
                return JSON.parse(value);
        } catch (error) {
                return fallback;
        }
};

const collectTargets = (helpers = []) => {
        const rawTargets = flatten(helpers.map((helper = {}) => {
                const selectors = [];

                if (helper.selector && isString(helper.selector)) {
                        selectors.push(helper.selector);
                }

                if (helper.childrenSelector && isString(helper.childrenSelector)) {
                        selectors.push(helper.childrenSelector);
                }

                return selectors
                        .join(',')
                        .split(',')
                        .map((selector) => trim(selector))
                        .filter(Boolean)
                        .map((selector) => ({selector}));
        }));

        const unique = uniqBy(rawTargets, (entry) => `${entry.selector}`);
        return slice(unique, 0, 100);
};

const buildRulesPayload = (state, tests, criteriaById, helpersByTestId, referenceVersion) => tests.map((test) => {
        const criterion = criteriaById[test.criterionId] || {};
        const ruleId = `RGAA-${referenceVersion}-${test.id}`;
        const comment = getTestComment(state, test.id) || '';
        const helpers = helpersByTestId[test.id] || [];
        const targets = collectTargets(helpers);

        return {
                ruleId,
                ruleTitle: sanitizeHtml(test.title),
                ruleLevel: criterion.level || '',
                userContext: comment ? trim(comment) : '',
                targets
        };
});

const normaliseResults = (payloadResults = [], {model, receivedAt}) => {
        const items = {};
        const sortedResults = sortBy(payloadResults, 'ruleId');

        sortedResults.forEach((result) => {
                if (!result || !result.ruleId) {
                        return;
                }

                const status = result.result || result.status;

                if (!RESULT_VALUES.includes(status)) {
                        return;
                }

                const comment = trim(result.comment || '');

                items[result.ruleId] = {
                        ruleId: result.ruleId,
                        ruleTitle: result.ruleTitle || '',
                        ruleLevel: result.ruleLevel || '',
                        result: status,
                        comment: comment.length > 500 ? comment.slice(0, 500) : comment,
                        receivedAt,
                        model: result.model || model
                };
        });

        return items;
};

function buildRequestBody({
        provider,
        model,
        rules,
        page,
        locale,
        additionalParameters
}) {
        return {
                provider,
                model,
                locale,
                page,
                rules,
                ...additionalParameters
        };
}

const mergeContexts = (rules) => rules.reduce((acc, rule) => ({
        ...acc,
        [rule.ruleId]: rule.targets || []
}), {});

export function* runAnalysisSaga() {
        try {
                const state = yield select();
                const tests = yield select(getEnabled);

                if (!tests.length) {
                        throw new Error('AI_ANALYSIS_EMPTY_SELECTION');
                }

                const referenceVersion = yield select(getVersion);
                const criteriaById = yield select(getAllCriteria);
                const allTestsById = yield select(getAllTests);
                const helpersByTestId = state.helpers || {};
                const aiConfig = yield select(getAiConfig);
                const page = {
                        url: yield select(getPageUrl),
                        title: yield select(getPageTitle)
                };

                if (!aiConfig || !aiConfig.endpoint) {
                        throw new Error('AI_ANALYSIS_MISSING_ENDPOINT');
                }

                const selectedTests = tests.map((test) => (
                        allTestsById[test.id] || test
                ));

                const rules = buildRulesPayload(
                        state,
                        selectedTests,
                        criteriaById,
                        helpersByTestId,
                        referenceVersion
                );

                const requestHeaders = {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                };

                if (aiConfig.apiKey) {
                        requestHeaders.Authorization = `Bearer ${aiConfig.apiKey}`;
                }

                const additionalHeaders = parseJson(aiConfig.additionalHeaders, {});

                Object.assign(requestHeaders, additionalHeaders || {});

                const additionalParameters = parseJson(aiConfig.additionalParameters, {});

                const body = buildRequestBody({
                        provider: aiConfig.provider,
                        model: aiConfig.model,
                        locale: aiConfig.locale || 'fr',
                        rules,
                        page,
                        additionalParameters
                });

                const endpoint = aiConfig.endpoint.replace(/\/$/, '');
                const url = `${endpoint}/ai/analyze-rgaa`;

                const response = yield call(fetch, url, {
                        method: 'POST',
                        headers: requestHeaders,
                        body: JSON.stringify(body)
                });

                if (!response.ok) {
                        const message = `AI_ANALYSIS_HTTP_${response.status}`;
                        throw new Error(message);
                }

                const data = yield call([response, response.json]);
                const receivedAt = new Date().toISOString();
                const model = data.model || aiConfig.model || '';
                const resultsArray = Array.isArray(data.results)
                        ? data.results
                        : map(data.results, (value, ruleId) => ({
                                ...(value || {}),
                                ruleId
                        }));

                const items = normaliseResults(resultsArray, {model, receivedAt});

                yield put(runAnalysisSuccess({
                        receivedAt,
                        model,
                        items,
                        contexts: mergeContexts(rules)
                }));
        } catch (error) {
                yield put(runAnalysisFailure(error.message || error));
        }
}

export function* watchRunAnalysis() {
        yield* takeLatest(RUN_ANALYSIS, runAnalysisSaga);
}
