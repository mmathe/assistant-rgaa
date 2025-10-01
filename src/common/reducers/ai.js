import {SET_CONFIG} from '../actions/ai';

/**
 *
 */
export const initialState = {
        provider: 'openai',
        endpoint: '',
        apiKey: '',
        model: '',
        additionalHeaders: '',
        additionalParameters: ''
};

/**
 *
 */
export default function ai(state = initialState, {type, payload}) {
        switch (type) {
                case SET_CONFIG:
                        return {
                                ...state,
                                ...payload.config
                        };

                default:
                        return state;
        }
}
