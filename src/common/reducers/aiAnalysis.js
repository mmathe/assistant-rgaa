import {RUN_ANALYSIS, RUN_ANALYSIS_SUCCESS, RUN_ANALYSIS_FAILURE, RESET_ANALYSIS_ERROR} from '../actions/aiAnalysis';

export const initialState = {
        status: 'idle',
        lastRunAt: null,
        model: '',
        error: null,
        items: {},
        contexts: {}
};

export default function aiAnalysis(state = initialState, {type, payload}) {
        switch (type) {
                case RUN_ANALYSIS:
                        return {
                                ...state,
                                status: 'loading',
                                error: null
                        };

                case RUN_ANALYSIS_SUCCESS:
                        return {
                                ...state,
                                status: 'succeeded',
                                error: null,
                                lastRunAt: payload.receivedAt,
                                model: payload.model,
                                items: payload.items,
                                contexts: payload.contexts
                        };

                case RUN_ANALYSIS_FAILURE:
                        return {
                                ...state,
                                status: 'failed',
                                error: payload.error,
                                lastRunAt: payload.receivedAt || state.lastRunAt
                        };

                case RESET_ANALYSIS_ERROR:
                        return {
                                ...state,
                                error: null
                        };

                default:
                        return state;
        }
}
