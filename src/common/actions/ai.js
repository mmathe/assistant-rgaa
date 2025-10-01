/**
 *
 */
export const SET_CONFIG = 'common/ai/SET_CONFIG';
export const SAVE_CONFIG = 'common/ai/SAVE_CONFIG';

/**
 *
 */
export const setConfig = (config) => ({
        type: SET_CONFIG,
        payload: {config}
});

/**
 *
 */
export const saveConfig = (config) => ({
        type: SAVE_CONFIG,
        payload: {config}
});
