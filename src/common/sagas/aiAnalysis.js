import {takeLatest} from 'redux-saga';
import {call, put, select} from 'redux-saga/effects';
import {isString, uniqBy, flatten, map, trim, slice, sortBy, compact} from 'lodash';
import {runAnalysisSuccess, runAnalysisFailure, RUN_ANALYSIS} from '../actions/aiAnalysis';
import {getEnabled} from '../selectors/tests';
import {getConfig as getAiConfig} from '../selectors/ai';
import {getAllTests, getAllCriteria, getVersion} from '../selectors/reference';
import {getPageTitle, getPageUrl} from '../selectors/panel';
import {getTestComment} from '../selectors/checklist';

const RESULT_VALUES = ['C', 'NC', 'NA'];

export const MAX_TARGETS_PER_RULE = 100;
export const MAX_HTML_SNIPPET_LENGTH = 1500;

const SENSITIVE_HTML_ATTRIBUTE_REGEX = /\s(on[a-z0-9_-]+|style)=("[^"]*"|'[^']*'|[^\s>]+)/gi;

export const sanitizeHtml = (value = '') => trim(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' '));

const sanitizeHtmlSnippet = (value = '') => {
        if (!value || !isString(value)) {
                return '';
        }

        return trim(
                value
                        .replace(SENSITIVE_HTML_ATTRIBUTE_REGEX, '')
                        .replace(/\s+/g, ' ')
        ).slice(0, MAX_HTML_SNIPPET_LENGTH);
};

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

export const collectTargets = (helpers = []) => {
        const normaliseEntry = ({selector, xpath, outerHtml, screenshotRef}) => {
                const entry = {};

                if (selector && isString(selector)) {
                        entry.selector = trim(selector);
                }

                if (xpath && isString(xpath)) {
                        entry.xpath = trim(xpath);
                }

                if (outerHtml && isString(outerHtml)) {
                        entry.outerHtml = sanitizeHtmlSnippet(outerHtml);
                }

                if (screenshotRef && isString(screenshotRef)) {
                        entry.screenshotRef = trim(screenshotRef);
                }

                return Object.keys(entry).length ? entry : null;
        };

        const expandHelperSelectors = (helper = {}) => {
                const selectors = [];

                if (helper.selector && isString(helper.selector)) {
                        selectors.push(helper.selector);
                }

                if (helper.childrenSelector && isString(helper.childrenSelector)) {
                        selectors.push(helper.childrenSelector);
                }

                const fromSelectors = selectors
                        .join(',')
                        .split(',')
                        .map((selector) => normaliseEntry({...helper, selector}));

                const fromTargets = Array.isArray(helper.targets)
                        ? helper.targets.map((target) => normaliseEntry(target))
                        : [];

                return compact([...fromSelectors, ...fromTargets]);
        };

        const rawTargets = flatten(helpers.map((helper) => expandHelperSelectors(helper)));

        const unique = uniqBy(
                rawTargets,
                (entry) => `${entry.selector || ''}|${entry.xpath || ''}|${entry.outerHtml || ''}|${entry.screenshotRef || ''}`
        );

        return slice(unique, 0, MAX_TARGETS_PER_RULE);
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

const PROMPT_DICTIONARY = {
        fr: {
                role: 'Tu es un expert en accessibilité numérique spécialisé dans le RGAA 4.1.2.',
                mission:
                        'Analyse chaque règle sélectionnée pour la page suivante et détermine si elle est conforme (C), non conforme (NC) ou non applicable (NA).',
                pageIntro: ({title, url}) => [
                        'Contexte de la page analysée :',
                        `- Titre : ${title || 'Non renseigné'}`,
                        `- URL : ${url || 'Non renseignée'}`
                ].join('\n'),
                ruleHeading: (index, {ruleId}) => `Règle ${index + 1} : ${ruleId}`,
                titleLabel: 'Intitulé',
                levelLabel: 'Niveau',
                userContextLabel: 'Notes auditeur',
                targetsTitle: 'Cibles transmises :',
                targetNone: '  - Aucune cible disponible. Analyse en te basant sur l’intitulé de la règle.',
                targetItem: (index) => `  - Cible ${index + 1} :`,
                fieldLabels: {
                        selector: 'Sélecteur',
                        xpath: 'XPath',
                        outerHtml: 'HTML',
                        screenshotRef: 'Capture'
                },
                jsonFormat: [
                        'Réponds strictement avec un objet JSON valide (sans texte additionnel) respectant cette structure :',
                        '{',
                        '  "results": [',
                        '    {',
                        '      "ruleId": "...",',
                        '      "ruleTitle": "...",',
                        '      "ruleLevel": "...",',
                        '      "result": "C" | "NC" | "NA",',
                        '      "comment": "Commentaire en français (≤ 500 caractères)"',
                        '    }',
                        '  ],',
                        '  "model": "fournisseur@version"',
                        '}',
                        'Contraintes :',
                        '- Utilise uniquement les valeurs C, NC ou NA pour « result » ;',
                        '- Respecte l’ordre des règles fourni ;',
                        '- Fournis un commentaire concis en français (≤ 500 caractères) justifiant la décision ;',
                        '- Ne rajoute aucun texte en dehors du JSON.'
                ].join('\n')
        },
        en: {
                role: 'You are an accessibility expert specialised in RGAA 4.1.2.',
                mission:
                        'Review each selected rule for the following page and decide whether it is Compliant (C), Not Compliant (NC) or Not Applicable (NA).',
                pageIntro: ({title, url}) => [
                        'Page context:',
                        `- Title: ${title || 'Not provided'}`,
                        `- URL: ${url || 'Not provided'}`
                ].join('\n'),
                ruleHeading: (index, {ruleId}) => `Rule ${index + 1}: ${ruleId}`,
                titleLabel: 'Title',
                levelLabel: 'Level',
                userContextLabel: 'Auditor notes',
                targetsTitle: 'Provided targets:',
                targetNone: '  - No target available. Base your reasoning on the rule description.',
                targetItem: (index) => `  - Target ${index + 1}:`,
                fieldLabels: {
                        selector: 'Selector',
                        xpath: 'XPath',
                        outerHtml: 'HTML',
                        screenshotRef: 'Screenshot'
                },
                jsonFormat: [
                        'Respond strictly with a valid JSON object (no extra text) matching this structure:',
                        '{',
                        '  "results": [',
                        '    {',
                        '      "ruleId": "...",',
                        '      "ruleTitle": "...",',
                        '      "ruleLevel": "...",',
                        '      "result": "C" | "NC" | "NA",',
                        '      "comment": "English summary (≤ 500 characters)"',
                        '    }',
                        '  ],',
                        '  "model": "provider@version"',
                        '}',
                        'Constraints:',
                        '- Only use the values C, NC or NA for "result";',
                        '- Keep the rule order identical to the input;',
                        '- Provide a short justification in English (≤ 500 characters);',
                        '- Do not add any text outside of the JSON.'
                ].join('\n')
        }
};

const formatTargetForPrompt = (target = {}, index, dictionary) => {
        const lines = [dictionary.targetItem(index)];
        const {fieldLabels} = dictionary;

        if (target.selector) {
                lines.push(`    ${fieldLabels.selector}: ${target.selector}`);
        }

        if (target.xpath) {
                lines.push(`    ${fieldLabels.xpath}: ${target.xpath}`);
        }

        if (target.outerHtml) {
                lines.push(`    ${fieldLabels.outerHtml}: ${target.outerHtml}`);
        }

        if (target.screenshotRef) {
                lines.push(`    ${fieldLabels.screenshotRef}: ${target.screenshotRef}`);
        }

        return lines.join('\n');
};

const formatRuleForPrompt = (rule = {}, index, dictionary) => {
        const lines = [
                dictionary.ruleHeading(index, rule),
                `${dictionary.titleLabel}: ${rule.ruleTitle || ''}`
        ];

        if (rule.ruleLevel) {
                lines.push(`${dictionary.levelLabel}: ${rule.ruleLevel}`);
        }

        if (rule.userContext) {
                lines.push(`${dictionary.userContextLabel}: ${rule.userContext}`);
        }

        lines.push(dictionary.targetsTitle);

        if (!rule.targets || !rule.targets.length) {
                lines.push(dictionary.targetNone);
        } else {
                lines.push(
                        rule.targets
                                .map((target, targetIndex) => formatTargetForPrompt(target, targetIndex, dictionary))
                                .join('\n')
                );
        }

        return lines.join('\n');
};

export const buildPrompt = ({locale = 'fr', page = {}, rules = []}) => {
        const normalizedLocale = String(locale).toLowerCase().startsWith('en') ? 'en' : 'fr';
        const dictionary = PROMPT_DICTIONARY[normalizedLocale];
        const header = [
                dictionary.role,
                dictionary.mission,
                dictionary.pageIntro({
                        title: sanitizeHtml(page.title || ''),
                        url: trim(page.url || '')
                })
        ];

        const ruleSections = rules.map((rule, index) => formatRuleForPrompt(rule, index, dictionary));

        return [...header, ...ruleSections, dictionary.jsonFormat].filter(Boolean).join('\n\n');
};

function buildRequestBody({
        provider,
        model,
        rules,
        page,
        locale,
        prompt,
        additionalParameters
}) {
        return {
                provider,
                model,
                locale,
                page,
                rules,
                prompt,
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
                const prompt = buildPrompt({
                        locale: aiConfig.locale || 'fr',
                        page,
                        rules
                });

                const body = buildRequestBody({
                        provider: aiConfig.provider,
                        model: aiConfig.model,
                        locale: aiConfig.locale || 'fr',
                        rules,
                        page,
                        prompt,
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
