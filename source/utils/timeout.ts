import {TimeoutError} from '../errors/TimeoutError.js';

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
	return new Promise((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			if (abortController) {
				abortController.abort();
			}

			reject(new TimeoutError(request));
		}, options.timeout);

		console.log("request body", {
			body: request.body,
			req: request,
		})

		void options
			.fetch(request.url, {
				body: request.body,
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
				signal: request.signal
			})
			.then(resolve)
			.catch(reject)
			.then(() => {
				clearTimeout(timeoutId);
			});
	});
}
