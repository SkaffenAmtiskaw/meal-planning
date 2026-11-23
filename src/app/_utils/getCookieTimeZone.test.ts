import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cookies } from 'next/headers';

import { getCookieTimeZone } from './getCookieTimeZone';

vi.mock('next/headers', async () => await import('#mocks/next/headers'));

const mockCookie = (value: string) => {
	vi.mocked(cookies).mockResolvedValueOnce({
		get: vi.fn().mockReturnValue({ value }),
	} as never);
};

describe('getCookieTimeZone', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns the zone in the timeZone cookie when it is valid', async () => {
		mockCookie('Asia/Tokyo');

		expect(await getCookieTimeZone()).toBe('Asia/Tokyo');
	});

	it('returns null when there is no timeZone cookie', async () => {
		expect(await getCookieTimeZone()).toBeNull();
	});

	it('returns null when the cookie holds an invalid zone', async () => {
		mockCookie('Not/AZone');

		expect(await getCookieTimeZone()).toBeNull();
	});
});
