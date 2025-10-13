import {get} from 'lodash';



/**
 *	Tells if the extension currently runs on chrome.
 */
const IS_CHROME = (
	typeof browser === 'undefined'
	|| browser.runtime === undefined
);

/**
 *	Wraps the given chrome API method so it returns a promise
 *	instead of using a callback.
 */
const chromeApi = (fn) => {
	if (!fn) {
		console.error('Chrome API method is undefined');
		return () => Promise.reject(new Error('Chrome API method is undefined'));
	}
	return (...args) =>
		new Promise((resolve, reject) =>
			fn(...args, (result) => {
				if (chrome.runtime.lastError) {
					reject(chrome.runtime.lastError);
				} else {
					resolve(result);
				}
			})
		);
};

/**
 *	Returns a cross browser version of a browser API method.
 */
export const api = (method) =>
	IS_CHROME
		? chromeApi(get(chrome, method))
		: get(browser, method);

/**
 *	Returns the full URL for a relative path within the extension.
 *	Compatible with both old (chrome.extension.getURL) and new (chrome.runtime.getURL) APIs.
 */
export const getURL = (path) => {
	if (chrome.runtime && chrome.runtime.getURL) {
		return chrome.runtime.getURL(path);
	}
	// Fallback pour les anciennes versions
	if (chrome.extension && chrome.extension.getURL) {
		return chrome.extension.getURL(path);
	}
	// Pour Firefox
	if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.getURL) {
		return browser.runtime.getURL(path);
	}
	console.error('No getURL API available');
	return path;
};
