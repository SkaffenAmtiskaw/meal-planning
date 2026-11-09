import {
	getReportingToken,
	POSTHOG_ASSETS_HOST,
	POSTHOG_HOST,
	RELAY_PATH,
} from '@/_utils/errorReporting';

const ASSET_PATHS = ['/static/', '/array/'];

const EVENTS_PATHS = ['/i/v0/e', '/i/v0/e/'];

/**
 * Whether `posthog-js` uses the path: its scripts under `/static/`, this project's config under
 * `/array/<token>/`, and its events at `/i/v0/e`. With reporting off there's no token, so no
 * `/array/` path passes.
 */
const isPosthogJsPath = (path: string) => {
	const token = getReportingToken();
	return (
		path.startsWith('/static/') ||
		(token !== undefined && path.startsWith(`/array/${token}/`)) ||
		EVENTS_PATHS.includes(path)
	);
};

/** Copies only Content-Type, so no other header, such as the session cookie, passes through. */
const contentTypeOnly = (headers: Headers) => {
	const contentType = headers.get('content-type');
	return new Headers(contentType ? { 'Content-Type': contentType } : {});
};

/**
 * Whether a request comes from the app's own pages, so other sites can't use the relay. Browsers send
 * `Sec-Fetch-Site` on every request; `Origin` is the fallback for one that doesn't.
 */
const isFromAppPages = (request: Request) => {
	const fetchSite = request.headers.get('sec-fetch-site');
	if (fetchSite) return fetchSite === 'same-origin';
	return request.headers.get('origin') === new URL(request.url).origin;
};

/**
 * Passes `posthog-js`'s requests to PostHog through the app's own domain, so ad blockers that block
 * PostHog's hosts let them through. A rewrite would forward the request's headers, cookies included.
 */
const relay = async (request: Request) => {
	if (!isFromAppPages(request)) return new Response(null, { status: 403 });

	const { pathname, search } = new URL(request.url);
	const path = pathname.slice(RELAY_PATH.length);
	if (!isPosthogJsPath(path)) return new Response(null, { status: 404 });

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
