import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getReportingToken, isReportingOn } from './errorReporting';

const env = vi.hoisted(() => ({
	NEXT_PUBLIC_VERCEL_ENV: undefined as string | undefined,
	NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: undefined as string | undefined,
}));

vi.mock('@/env', () => ({ env }));

describe('errorReporting', () => {
	beforeEach(() => {
		env.NEXT_PUBLIC_VERCEL_ENV = undefined;
		env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = undefined;
	});

	describe.each([
		'production',
		'preview',
		'development',
		undefined,
	])('when NEXT_PUBLIC_VERCEL_ENV is %s', (vercelEnv) => {
		const on = vercelEnv === 'production';

		it(`is ${on ? 'on' : 'off'} with the token`, () => {
			env.NEXT_PUBLIC_VERCEL_ENV = vercelEnv;
			env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = 'phc_token';

			expect(isReportingOn()).toBe(on);
			expect(getReportingToken()).toBe(on ? 'phc_token' : undefined);
		});

		it('is off without the token', () => {
			env.NEXT_PUBLIC_VERCEL_ENV = vercelEnv;

			expect(isReportingOn()).toBe(false);
			expect(getReportingToken()).toBeUndefined();
		});
	});
});
