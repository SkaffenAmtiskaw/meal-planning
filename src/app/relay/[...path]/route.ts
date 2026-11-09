import {
	POSTHOG_ASSETS_HOST,
	POSTHOG_HOST,
	RELAY_PATH,
} from '@/_utils/errorReporting';

const ASSET_PATHS = ['/static/', '/array/'];

/** Copies only Content-Type, so no other header, such as the session cookie, passes through. */
const contentTypeOnly = (headers: Headers) => {
	const contentType = headers.get('content-type');
	return new Headers(contentType ? { 'Content-Type': contentType } : {});
};

/**
 * Passes `posthog-js`'s requests to PostHog through the app's own domain, so ad blockers that block
 * PostHog's hosts let them through. A rewrite would forward the request's headers, cookies included.
 */
const relay = async (request: Request) => {
	const { pathname, search } = new URL(request.url);
	const path = pathname.slice(RELAY_PATH.length);
	const host = ASSET_PATHS.some((prefix) => path.startsWith(prefix))
		? POSTHOG_ASSETS_HOST
		: POSTHOG_HOST;

	const response = await fetch(`${host}${path}${search}`, {
		method: request.method,
		headers: contentTypeOnly(request.headers),
		body: request.method === 'POST' ? await request.arrayBuffer() : undefined,
	});

	return new Response(response.body, {
		status: response.status,
		headers: contentTypeOnly(response.headers),
	});
};

export const GET = relay;
export const POST = relay;
