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
	return new Promise(async (resolve, reject) => {
		const timeoutId = setTimeout(() => {
			if (abortController) {
				abortController.abort();
			}

			reject(new TimeoutError(request));
		}, options.timeout);

		void options
			.fetch(request, {
				headers: request.headers,
				credentials: request.credentials,
				method: request.method,
				mode: request.mode,
			})
			.then(resolve)
			.catch(reject)
			.then(() => {
				clearTimeout(timeoutId);
			});
	});
}
