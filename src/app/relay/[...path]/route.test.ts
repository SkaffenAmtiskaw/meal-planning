import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getReportingToken } from '@/_utils/errorReporting';

import { GET, POST } from './route';

vi.mock('@/_utils/errorReporting', () => ({
	getReportingToken: vi.fn(() => 'phc_token'),
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
		'/relay/i/v0/e?compression=gzip-js&ver=1',
		'/relay/i/v0/e/?ver=1',
	])('sends %s to the ingestion host', async (path) => {
		await GET(sameOrigin(path));

		expect(forwarded().url).toBe(
			`https://ingest.example.com${path.slice('/relay'.length)}`,
		);
	});

	describe("refuses paths posthog-js doesn't use", () => {
		it.each([
			['an unlisted path', '/relay/api/projects'],
			['a path that only starts like an allowed one', '/relay/statics/x'],
			['a path that extends the events path', '/relay/i/v0/e/x'],
			["another project's config", '/relay/array/phc_OTHER/config.js'],
			['a token with no file after it', '/relay/array/phc_token'],
		])('refuses %s with an empty 404', async (_case, path) => {
			const response = await GET(sameOrigin(path));

			expect(response.status).toBe(404);
			expect(await response.text()).toBe('');
			expect(fetchMock).not.toHaveBeenCalled();
		});

		it('refuses every /array/ path when reporting is off', async () => {
			vi.mocked(getReportingToken).mockReturnValueOnce(undefined);

			const response = await GET(
				sameOrigin('/relay/array/phc_token/config.js'),
			);

			expect(response.status).toBe(404);
			expect(fetchMock).not.toHaveBeenCalled();
		});
	});

	it('forwards a POST body and its Content-Type, and never the cookies', async () => {
		await POST(
			sameOrigin('/relay/i/v0/e', {
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

	describe('caps a POST body at 1 MB', () => {
		const CAP = 1024 * 1024;

		const post = (body: string, headers: Record<string, string> = {}) =>
			POST(sameOrigin('/relay/i/v0/e', { method: 'POST', body, headers }));

		it('forwards a body at the cap', async () => {
			await post('x'.repeat(CAP));

			expect((forwarded().init?.body as ArrayBuffer).byteLength).toBe(CAP);
		});

		it('refuses a body whose Content-Length is over the cap with an empty 413', async () => {
			const response = await post('x', { 'Content-Length': `${CAP + 1}` });

			expect(response.status).toBe(413);
			expect(await response.text()).toBe('');
			expect(fetchMock).not.toHaveBeenCalled();
		});

		it('refuses a body over the cap that has no Content-Length with an empty 413', async () => {
			const response = await post('x'.repeat(CAP + 1));

			expect(response.status).toBe(413);
			expect(await response.text()).toBe('');
			expect(fetchMock).not.toHaveBeenCalled();
		});
	});

	it('sends a GET with no body and no headers', async () => {
		await GET(
			sameOrigin('/relay/i/v0/e', {
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

		const response = await GET(sameOrigin('/relay/i/v0/e'));

		expect(response.status).toBe(429);
		expect(await response.text()).toBe('rate limited');
		expect([...response.headers.keys()]).toEqual(['content-type']);
		expect(response.headers.get('content-type')).toBe('text/plain');
	});

	describe("passes PostHog's Cache-Control on asset responses", () => {
		const withCacheControl = () =>
			fetchMock.mockResolvedValueOnce(
				new Response('script', {
					status: 200,
					headers: {
						'Content-Type': 'application/javascript',
						'Cache-Control': 'public, max-age=300',
					},
				}),
			);

		it.each([
			'/relay/static/exception-autocapture.js',
			'/relay/array/phc_token/config.js',
		])('returns it on %s, also as Vercel-CDN-Cache-Control', async (path) => {
			withCacheControl();

			const response = await GET(sameOrigin(path));

			expect(response.headers.get('cache-control')).toBe('public, max-age=300');
			expect(response.headers.get('vercel-cdn-cache-control')).toBe(
				'public, max-age=300',
			);
		});

		it('adds no cache headers to an asset response that has no Cache-Control', async () => {
			const response = await GET(sameOrigin('/relay/static/x.js'));

			expect([...response.headers.keys()]).toEqual(['content-type']);
		});

		it('adds no cache headers to an events response', async () => {
			withCacheControl();

			const response = await GET(sameOrigin('/relay/i/v0/e'));

			expect([...response.headers.keys()]).toEqual(['content-type']);
		});

		it.each([
			[
				403,
				new Request('https://app.example.com/relay/static/x.js', {
					headers: { 'Sec-Fetch-Site': 'cross-site' },
				}),
			],
			[404, sameOrigin('/relay/static')],
			[
				413,
				sameOrigin('/relay/i/v0/e', {
					method: 'POST',
					body: 'x',
					headers: { 'Content-Length': `${1024 * 1024 + 1}` },
				}),
			],
		])('adds no cache headers to its own %i', async (status, request) => {
			const response = await POST(request);

			expect(response.status).toBe(status);
			expect([...response.headers.keys()]).toEqual([]);
		});
	});

	it('returns no Content-Type when PostHog sends none', async () => {
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

		const response = await GET(sameOrigin('/relay/i/v0/e'));

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
				new Request('https://app.example.com/relay/i/v0/e', {
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
				new Request('https://app.example.com/relay/i/v0/e', {
					method: 'POST',
					body: 'payload',
					headers: { Origin: 'https://app.example.com' },
				}),
			);

			expect(forwarded().url).toBe('https://ingest.example.com/i/v0/e');
		});
	});
});
