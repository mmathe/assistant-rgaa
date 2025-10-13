export const RUN_ANALYSIS = 'common/aiAnalysis/RUN_ANALYSIS';
export const RUN_ANALYSIS_SUCCESS = 'common/aiAnalysis/RUN_ANALYSIS_SUCCESS';
export const RUN_ANALYSIS_FAILURE = 'common/aiAnalysis/RUN_ANALYSIS_FAILURE';
export const RESET_ANALYSIS_ERROR = 'common/aiAnalysis/RESET_ANALYSIS_ERROR';

/**
 * Triggers an AI analysis for the currently selected rules.
 */
export const runAnalysis = () => ({
        type: RUN_ANALYSIS
});

/**
 * Clears the current error message after a failed AI analysis run.
 */
export const resetAnalysisError = () => ({
        type: RESET_ANALYSIS_ERROR
});

/**
 * Stores the AI analysis results.
 *
 * @param {Object} payload - Normalised analysis data.
 */
export const runAnalysisSuccess = (payload) => ({
        type: RUN_ANALYSIS_SUCCESS,
        payload
});

/**
 * Stores the error produced while running the AI analysis.
 *
 * @param {Error|string} error - The raised error.
 */
export const runAnalysisFailure = (error) => ({
        type: RUN_ANALYSIS_FAILURE,
        payload: {
                error
        }
});
