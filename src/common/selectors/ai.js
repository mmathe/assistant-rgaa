/**
 *
 */
export const getConfig = (state) => state.ai;

/**
 *
 */
export const getProvider = (state) => getConfig(state).provider;

/**
 *
 */
export const getEndpoint = (state) => getConfig(state).endpoint;
