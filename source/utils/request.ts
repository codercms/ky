import {supportsRequestStreams} from "../core/constants.js";

export const requestToInitParams = async (request: Request): Promise<RequestInit> => {
	let body;

	if (supportsRequestStreams) {
		body = request.body;
	} else {
		body = await request.blob();
	}

	const opts: RequestInit = {
		body: body,
		cache: request.cache,
		credentials: request.credentials,
		headers: request.headers,
		integrity: request.integrity,
		keepalive: request.keepalive,
		method: request.method,
		mode: request.mode,
		redirect: request.redirect,
		referrer: request.referrer,
		referrerPolicy: request.referrerPolicy,
		signal: request.signal,
	};

	if (body && supportsRequestStreams) {
		opts.duplex = request.duplex ?? 'half';
	}

	return opts;
};
