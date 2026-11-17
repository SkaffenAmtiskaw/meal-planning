import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { auth } from '@/_auth';
import { changeAuthUserEmail } from '@/_auth/users';
import { users } from '@/_models/database/users';

import { verifyEmailChange } from './verifyEmailChange';

vi.mock('@/_auth', () => ({ auth: {} }));

vi.mock('@/_auth/users', async () => await import('#mocks/@/_auth/users'));

vi.mock(
	'@/_models/database/users',
	async () => await import('#mocks/@/_models/database/users'),
);

const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
const pastDate = new Date(Date.now() - 1000 * 60 * 60);

const makeMockUser = (overrides = {}) => ({
	email: 'user@example.com',
	pendingEmailChange: {
		email: 'new@example.com',
		token: 'valid-token',
		expiresAt: futureDate,
	},
	...overrides,
});

const givenUserWithToken = (user: unknown) => {
	vi.mocked(users.findOne).mockResolvedValueOnce(user as never);
};

const setupValidUser = () => givenUserWithToken(makeMockUser());

describe('verifyEmailChange', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('validation', () => {
		test('returns an invalid link error when no user has the given token', async () => {
			givenUserWithToken(null);

			const result = await verifyEmailChange('bad-token');

			expect(result).toEqual({
				ok: false,
				error: 'This link is invalid or has expired.',
			});
		});

		test('returns an invalid link error when the user has no pending email change', async () => {
			givenUserWithToken(makeMockUser({ pendingEmailChange: null }));

			const result = await verifyEmailChange('valid-token');

			expect(result).toEqual({
				ok: false,
				error: 'This link is invalid or has expired.',
			});
		});

		test('returns an invalid link error when the token has expired', async () => {
			givenUserWithToken(
				makeMockUser({
					pendingEmailChange: {
						email: 'new@example.com',
						token: 'expired-token',
						expiresAt: pastDate,
					},
				}),
			);

			const result = await verifyEmailChange('expired-token');

			expect(result).toEqual({
				ok: false,
				error: 'This link is invalid or has expired.',
			});
		});
	});

	describe('success', () => {
		beforeEach(() => {
			setupValidUser();
		});

		test("changes the better-auth user's email", async () => {
			await verifyEmailChange('valid-token');

			expect(changeAuthUserEmail).toHaveBeenCalledWith(
				auth,
				'user@example.com',
				'new@example.com',
			);
		});

		test("updates the app user's email and clears the pending change", async () => {
			await verifyEmailChange('valid-token');

			expect(users.updateOne).toHaveBeenCalledWith(
				{ email: 'user@example.com' },
				{
					$set: { email: 'new@example.com' },
					$unset: { pendingEmailChange: '' },
				},
			);
		});

		test('returns ok: true on success', async () => {
			const result = await verifyEmailChange('valid-token');

			expect(result).toEqual({ ok: true, data: undefined });
		});
	});
});
