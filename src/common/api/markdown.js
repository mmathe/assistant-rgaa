import {getURL} from './extension';

/**
 *
 */
export const replaceLocalUrls = (body, basePath) =>
	body.replace(
		/page:\/\/([a-z0-9/_-]+)/gi,
		(match, path) =>
			getURL(`${basePath}/${path}`)
	);
