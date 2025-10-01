import {RESET, SET_TEST_DONE, SET_TEST_COMMENT} from '../actions/checklist';



/**
 *
 */
const initialState = {};

/**
 *
 */
export default function checklist(state = initialState, {type, payload}) {
	switch (type) {
                case SET_TEST_DONE: {
                        const previous = state[payload.id];
                        const comment = previous && typeof previous === 'object'
                                ? previous.comment || ''
                                : '';

                        return {
                                ...state,
                                [payload.id]: {
                                        done: payload.done,
                                        comment
                                }
                        };
                }

                case SET_TEST_COMMENT: {
                        const previous = state[payload.id];
                        const done = previous && typeof previous === 'object'
                                ? Boolean(previous.done)
                                : Boolean(previous);

                        return {
                                ...state,
                                [payload.id]: {
                                        done,
                                        comment: payload.comment
                                }
                        };
                }

                case RESET:
                        return initialState;

                default:
			return state;
	}
}
