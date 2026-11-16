import { afterEach, describe, expect, test, vi } from 'vitest';

import { auth } from '@/_auth';
import { sendEmailChangeEmail } from '@/_auth/emails';
import { findAuthUser } from '@/_auth/users';
import { users } from '@/_models/database/users';
import { env } from '@/env';

import { requestEmailChange } from './requestEmailChange';

vi.mock('next/headers', async () => await import('#mocks/next/headers'));

vi.mock('@/_auth', () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

vi.mock('@/_auth/users', async () => await import('#mocks/@/_auth/users'));

vi.mock(
	'@/_models/database/users',
	async () => await import('#mocks/@/_models/database/users'),
);

vi.mock('@/_auth/emails', () => ({
	sendEmailChangeEmail: vi.fn(),
}));

const mockSession = { user: { email: 'current@example.com' } };

const makeMockUser = (
	overrides: {
		pendingEmailChange?: {
			email: string;
			token: string;
			expiresAt: Date;
		} | null;
	} = {},
) => ({
	email: 'current@example.com',
	pendingEmailChange: null as {
		email: string;
		token: string;
		expiresAt: Date;
	} | null,
	...overrides,
});

const givenUser = (user: unknown) => {
	vi.mocked(users.findOne).mockResolvedValueOnce(user as never);
};

/** The pending change the action stored, read from its update. */
const storedChange = () => {
	const update = vi.mocked(users.updateOne).mock.calls[0][1] as {
		$set: {
			pendingEmailChange: { email: string; token: string; expiresAt: Date };
		};
	};
	return update.$set.pendingEmailChange;
};

describe('requestEmailChange', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('authentication', () => {
		test('returns error when not authenticated', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);

			const result = await requestEmailChange('new@example.com');

			expect(result).toEqual({ ok: false, error: 'Not authenticated.' });
		});
	});

	describe('validation', () => {
		test('returns error for invalid email', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(
				mockSession as never,
			);

			const result = await requestEmailChange('not-an-email');

			expect(result).toEqual({
				ok: false,
				error: 'Please enter a valid email address.',
			});
		});

		test('returns error when new email equals current email', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(
				mockSession as never,
			);

			const result = await requestEmailChange('current@example.com');

			expect(result).toEqual({
				ok: false,
				error: 'New email must be different from your current email.',
			});
		});

		test('returns error when new email is already taken', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(
				mockSession as never,
			);
			vi.mocked(findAuthUser).mockResolvedValueOnce({
				user: {},
				accounts: [],
			} as never);

			const result = await requestEmailChange('taken@example.com');

			expect(result).toEqual({
				ok: false,
				error: 'An account with that email already exists.',
			});
			expect(findAuthUser).toHaveBeenCalledWith(auth, 'taken@example.com');
		});
	});

	describe('user lookup', () => {
		test('returns error when user is not found in app database', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(
				mockSession as never,
			);
			givenUser(null);

			const result = await requestEmailChange('new@example.com');

			expect(result).toEqual({ ok: false, error: 'User not found.' });
		});
	});

	describe('success', () => {
		test('returns success with hadPreviousRequest false when no existing pending change', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(
				mockSession as never,
			);
			givenUser(makeMockUser({ pendingEmailChange: null }));

			const result = await requestEmailChange('new@example.com');

			expect(result).toEqual({ ok: true, data: { hadPreviousRequest: false } });
		});

		test('returns success with hadPreviousRequest true when a pending change existed', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(
				mockSession as never,
			);
			givenUser(
				makeMockUser({
					pendingEmailChange: {
						email: 'old-pending@example.com',
						token: 'old-token',
						expiresAt: new Date(),
					},
				}),
			);

			const result = await requestEmailChange('new@example.com');

			expect(result).toEqual({ ok: true, data: { hadPreviousRequest: true } });
		});
	});

	describe('side effects', () => {
		test('saves pending email change with 64-char hex token and 24-hour expiry', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(
				mockSession as never,
			);
			givenUser(makeMockUser());

			const before = Date.now();
			await requestEmailChange('new@example.com');
			const after = Date.now();

			expect(users.updateOne).toHaveBeenCalledOnce();
			expect(vi.mocked(users.updateOne).mock.calls[0][0]).toEqual({
				email: 'current@example.com',
			});
			const { email, token, expiresAt } = storedChange();
			expect(email).toBe('new@example.com');
			expect(token).toMatch(/^[0-9a-f]{64}$/);
			expect(expiresAt.getTime()).toBeGreaterThanOrEqual(
				before + 24 * 60 * 60 * 1000,
			);
			expect(expiresAt.getTime()).toBeLessThanOrEqual(
				after + 24 * 60 * 60 * 1000,
			);
		});

		test('sends verification email to the new address with the stored token in the url', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(
				mockSession as never,
			);
			givenUser(makeMockUser());

			await requestEmailChange('new@example.com');

			const storedToken = storedChange().token;
			expect(vi.mocked(sendEmailChangeEmail)).toHaveBeenCalledWith({
				newEmail: 'new@example.com',
				url: `${env.BETTER_AUTH_URL}/verify-email-change?token=${storedToken}`,
			});
		});
	});
});
