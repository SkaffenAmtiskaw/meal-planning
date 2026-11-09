import {
	getReportingToken,
	POSTHOG_ASSETS_HOST,
	POSTHOG_HOST,
	RELAY_PATH,
} from '@/_utils/errorReporting';

/**
 * The path prefixes `posthog-js` loads from PostHog's assets host
 * (https://posthog.com/docs/advanced/proxy/proxy-reference): its scripts under `/static/`, and this
 * project's config under `/array/<token>/`. With reporting off there's no token, so no `/array/` path
 * passes.
 */
const getAssetPrefixes = () => {
	const token = getReportingToken();
	return token === undefined ? ['/static/'] : ['/static/', `/array/${token}/`];
};

/**
 * PostHog's events endpoint (https://posthog.com/docs/api/capture). Its docs name it `/i/v0/e` and
 * send to `/i/v0/e/`. In the browser, `posthog-js` 1.447.3 posted to `/i/v0/e`, and the project's
 * config gave the endpoint as `/i/v0/e/`, so both forms pass.
 */
const EVENTS_PATHS = ['/i/v0/e', '/i/v0/e/'];

/** Well above a `$exception` event of a few KB, and below Vercel's 4.5 MB request limit. */
const MAX_BODY_BYTES = 1024 * 1024;

const tooLarge = () => new Response(null, { status: 413 });

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
	const isAsset = getAssetPrefixes().some((prefix) => path.startsWith(prefix));
	if (!isAsset && !EVENTS_PATHS.includes(path))
		return new Response(null, { status: 404 });

	const host = isAsset ? POSTHOG_ASSETS_HOST : POSTHOG_HOST;

	let body: ArrayBuffer | undefined;
	if (request.method === 'POST') {
		if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES)
			return tooLarge();
		// A chunked body has no Content-Length, so the size read is checked too.
		body = await request.arrayBuffer();
		if (body.byteLength > MAX_BODY_BYTES) return tooLarge();
	}

	const response = await fetch(`${host}${path}${search}`, {
		method: request.method,
		headers: contentTypeOnly(request.headers),
		body,
	});

	const headers = contentTypeOnly(response.headers);
	const cacheControl = response.headers.get('cache-control');
	if (isAsset && cacheControl) {
		headers.set('Cache-Control', cacheControl);
		// Vercel's CDN caches a function's response only with `s-maxage` or this header, and PostHog
		// sends neither, so without it every fetch of a script runs the function.
		headers.set('Vercel-CDN-Cache-Control', cacheControl);
	}

	return new Response(response.body, { status: response.status, headers });
};

export const GET = relay;
export const POST = relay;
