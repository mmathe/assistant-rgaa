/**
 *
 */
export const SET_TEST_DONE = 'common/checklist/SET_TEST_DONE';
export const SET_TEST_COMMENT = 'common/checklist/SET_TEST_COMMENT';
export const RESET = 'common/checklist/RESET';



/**
 *
 */
export const setTestDone = (id, done) => ({
        type: SET_TEST_DONE,
        payload: {
                id,
                done
        }
});

/**
 *
 */
export const setTestComment = (id, comment) => ({
        type: SET_TEST_COMMENT,
        payload: {
                id,
                comment
        }
});

/**
 *
 */
export const reset = () => ({
	type: RESET,
	payload: {}
});
