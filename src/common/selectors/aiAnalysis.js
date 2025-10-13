import {get, map, sortBy} from 'lodash';

export const getAnalysisState = (state) => state.aiAnalysis || {};

export const getAnalysisStatus = (state) => get(getAnalysisState(state), 'status', 'idle');

export const getAnalysisError = (state) => get(getAnalysisState(state), 'error', null);

export const getAnalysisLastRunAt = (state) => get(getAnalysisState(state), 'lastRunAt', null);

export const getAnalysisModel = (state) => get(getAnalysisState(state), 'model', '');

export const getAnalysisItems = (state) => get(getAnalysisState(state), 'items', {});

export const getAnalysisContexts = (state) => get(getAnalysisState(state), 'contexts', {});

export const getAnalysisList = (state) => sortBy(
        map(getAnalysisItems(state), (item) => item),
        ['ruleId']
);

export const hasAnalysisResults = (state) => getAnalysisList(state).length > 0;
