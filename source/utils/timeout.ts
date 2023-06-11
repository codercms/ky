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

		const opts = options as RequestInit;

		opts.headers = request.headers;
		opts.credentials = request.credentials;
		opts.mode = request.mode;

		console.log("fetch called", {
			req: request,
			opts,
		});

		void options
			.fetch(request, opts)
			.then(resolve)
			.catch(reject)
			.then(() => {
				clearTimeout(timeoutId);
			});
	});
}
