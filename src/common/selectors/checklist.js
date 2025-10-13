import {get, every} from 'lodash';



/**
 *
 */
export const isTestDone = (state, id) =>
        Boolean(getTestChecklistEntry(state, id).done);

/**
 *
 */
export const getTestComment = (state, id) =>
        getTestChecklistEntry(state, id).comment;

/**
 *
 */
export const areAllTestsDone = (state, tests) =>
        every(tests, ({id}) =>
                isTestDone(state, id)
        );

/**
 *
 */
const getTestChecklistEntry = (state, id) => {
        const value = get(state, ['checklist', id], false);

        if (value && typeof value === 'object') {
                return {
                        done: Boolean(value.done),
                        comment: value.comment || ''
                };
        }

        return {
                done: Boolean(value),
                comment: ''
        };
};
