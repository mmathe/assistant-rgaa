/**
 * Returns the AI configuration object from the Redux state.
 * @param {Object} state - The Redux state.
 * @returns {Object} The AI configuration object.
 */
export const getConfig = (state) => state.ai;

/**
 * Returns the AI provider from the configuration object in the Redux state.
 * @param {Object} state - The Redux state.

 */
export const getProvider = (state) => getConfig(state).provider;

/**
 * Returns the AI endpoint from the configuration object in the Redux state.
 * @param {Object} state - The Redux state.
 * @returns {string} The AI endpoint URL.
 */
export const getEndpoint = (state) => getConfig(state).endpoint;
