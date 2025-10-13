import {getURL} from './extension';

/*
 * retrieve the helpers mapping full json object from a given reference version
 */
export const getHelpers = (version) =>
	fetch(getURL(`data/helpers/${version}.json`))
		.then((response) => response.json())
		.catch(() => ({}));
