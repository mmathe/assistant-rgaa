import {api} from '../../common/api/extension';



/**
 *
 */
export const CONTENT_SCRIPTS = [
	'dist/common.js',
	'dist/container.js',
	'dist/helpers.js'
];

/**
 *
 */
export const CONTENT_STYLES = [
	'dist/container.css',
	'dist/helpers.css'
];

/**
 *
 */
export const sendMessageToTab = api('tabs.sendMessage');
export const createTab = api('tabs.create');

/**
 * Wrapper pour executeScript compatible Manifest V2 et V3
 */
export const executeScript = (tabId, details) => {
	// Manifest V3 utilise chrome.scripting.executeScript
	if (chrome.scripting && chrome.scripting.executeScript) {
		return chrome.scripting.executeScript({
			target: { tabId },
			files: details.file ? [details.file] : undefined,
			func: details.code ? new Function(details.code) : undefined
		});
	}
	// Manifest V2 utilise chrome.tabs.executeScript
	return api('tabs.executeScript')(tabId, details);
};

/**
 * Wrapper pour insertCSS compatible Manifest V2 et V3
 */
export const insertCSS = (tabId, details) => {
	// Manifest V3 utilise chrome.scripting.insertCSS
	if (chrome.scripting && chrome.scripting.insertCSS) {
		return chrome.scripting.insertCSS({
			target: { tabId },
			files: details.file ? [details.file] : undefined,
			css: details.code
		});
	}
	// Manifest V2 utilise chrome.tabs.insertCSS
	return api('tabs.insertCSS')(tabId, details);
};

/**
 *
 */
const fetchCurrentTabApi = api('tabs.query');
const captureVisibleTabApi = api('tabs.captureVisibleTab');

/**
 *
 */
export const fetchCurrentTab = async () => {
	const query = {
		active: true,
		currentWindow: true
	};

	const tabs = await fetchCurrentTabApi(query);

	if (!tabs.length) {
		throw new Error('No tab found');
	}

	return tabs[0];
};

/**
 *
 */
export const captureVisibleTab = async (options = {
	format: 'png'
}) => {
	const source = await captureVisibleTabApi(null, options);
	const image = new Image();
	image.src = source;

	return image;
};

/**
 *
 */
export const closeTab = (id) =>
	chrome.tabs.remove(id);

/**
 *
 */
export const onUpdate = (callback) =>
	chrome.tabs.onUpdated.addListener(callback);
