import {getURL} from './extension';

/**
 *	Retrieve instructions mapping for the given version.
 */
export const fetchInstructions = (version) =>
	fetch(getURL(`data/instructions/${version}.json`))
		.then((response) => response.json())
		.catch(() => ({}));
