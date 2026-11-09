import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET, POST } from './route';

vi.mock('@/_utils/errorReporting', () => ({
	POSTHOG_HOST: 'https://ingest.example.com',
	POSTHOG_ASSETS_HOST: 'https://assets.example.com',
	RELAY_PATH: '/relay',
}));

const fetchMock = vi.fn(
	async (_url: string, _init?: RequestInit) =>
		new Response('{"status":1}', {
			status: 200,
			headers: { 'Content-Type': 'application/json', 'X-Extra': 'kept out' },
		}),
);

const SAME_ORIGIN = { 'Sec-Fetch-Site': 'same-origin' };

/** A request from the app's own pages, which the relay forwards. */
const sameOrigin = (path: string, init: RequestInit = {}) =>
	new Request(`https://app.example.com${path}`, {
		...init,
		headers: { ...SAME_ORIGIN, ...(init.headers as Record<string, string>) },
	});

const forwarded = () => {
	const [url, init] = fetchMock.mock.calls[0];
	return { url, init, headers: new Headers(init?.headers) };
};

describe('relay route', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		fetchMock.mockClear();
	});

	it.each([
		'/relay/static/exception-autocapture.js?v=1',
		'/relay/array/phc_token/config.js',
	])('sends %s to the assets host', async (path) => {
		await GET(sameOrigin(path));

		expect(forwarded().url).toBe(
			`https://assets.example.com${path.slice('/relay'.length)}`,
		);
	});

	it.each([
		'/relay/e/?compression=gzip-js&ver=1',
		'/relay/flags/?v=2',
		'/relay/statics/x',
	])('sends %s to the ingestion host', async (path) => {
		await GET(sameOrigin(path));

		expect(forwarded().url).toBe(
			`https://ingest.example.com${path.slice('/relay'.length)}`,
		);
	});

	it('forwards a POST body and its Content-Type, and never the cookies', async () => {
		await POST(
			sameOrigin('/relay/e/', {
				method: 'POST',
				body: 'payload',
				headers: {
					'Content-Type': 'text/plain',
					Cookie: 'better-auth.session_token=secret',
					Authorization: 'Bearer secret',
				},
			}),
		);

		const { init, headers } = forwarded();
		expect(init?.method).toBe('POST');
		expect(new TextDecoder().decode(init?.body as ArrayBuffer)).toBe('payload');
		expect([...headers.keys()]).toEqual(['content-type']);
		expect(headers.get('content-type')).toBe('text/plain');
	});

	it('sends a GET with no body and no headers', async () => {
		await GET(
			sameOrigin('/relay/flags/', {
				headers: { Cookie: 'better-auth.session_token=secret' },
			}),
		);

		const { init, headers } = forwarded();
		expect(init?.method).toBe('GET');
		expect(init?.body).toBeUndefined();
		expect([...headers.keys()]).toEqual([]);
	});

	it("returns PostHog's status, body and Content-Type only", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response('rate limited', {
				status: 429,
				headers: { 'Content-Type': 'text/plain', 'Set-Cookie': 'ph=1' },
			}),
		);

		const response = await GET(sameOrigin('/relay/e/'));

		expect(response.status).toBe(429);
		expect(await response.text()).toBe('rate limited');
		expect([...response.headers.keys()]).toEqual(['content-type']);
		expect(response.headers.get('content-type')).toBe('text/plain');
	});

	it('returns no Content-Type when PostHog sends none', async () => {
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

		const response = await GET(sameOrigin('/relay/e/'));

		expect(response.status).toBe(204);
		expect(response.headers.get('content-type')).toBeNull();
	});

	describe("refuses requests that don't come from the app's own pages", () => {
		it.each([
			['a cross-site request', { 'Sec-Fetch-Site': 'cross-site' }],
			['a same-site request', { 'Sec-Fetch-Site': 'same-site' }],
			[
				'a cross-site request whose Origin is the app',
				{ 'Sec-Fetch-Site': 'cross-site', Origin: 'https://app.example.com' },
			],
			['an Origin of another site', { Origin: 'https://other-site.example' }],
			['a request with neither header', {}],
		])('refuses %s with an empty 403', async (_case, headers) => {
			const response = await POST(
				new Request('https://app.example.com/relay/e/', {
					method: 'POST',
					body: 'payload',
					headers,
				}),
			);

			expect(response.status).toBe(403);
			expect(await response.text()).toBe('');
			expect(fetchMock).not.toHaveBeenCalled();
		});

		it("forwards a request with no Sec-Fetch-Site whose Origin is the app's own", async () => {
			await POST(
				new Request('https://app.example.com/relay/e/', {
					method: 'POST',
					body: 'payload',
					headers: { Origin: 'https://app.example.com' },
				}),
			);

			expect(forwarded().url).toBe('https://ingest.example.com/e/');
		});
	});
});
