import {TimeoutError} from '../errors/TimeoutError.js';
import {supportsRequestStreams} from "../core/constants.js";

export type TimeoutOptions = {
	timeout: number;
	fetch: typeof fetch;
};

// `Promise.race()` workaround (#91)
export default async function timeout(
	request: Request,
	abortController: AbortController | undefined,
	options: TimeoutOptions,
): Promise<Response> {
	return new Promise(async (resolve, reject) => {
		const timeoutId = setTimeout(() => {
			if (abortController) {
				abortController.abort();
			}

			reject(new TimeoutError(request));
		}, options.timeout);

		console.log("request body", {
			body: request.body,
			req: request,
		});

		let body;
		if (request.headers.has("content-type")) {
			if (supportsRequestStreams) {
				body = request.body;
			} else {
				body = await request.arrayBuffer();
			}
		}

		void options
			.fetch(request.url, {
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
			})
			.then(resolve)
			.catch(reject)
			.then(() => {
				clearTimeout(timeoutId);
			});
	});
}
