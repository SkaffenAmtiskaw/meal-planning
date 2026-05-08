import { afterEach, describe, expect, test, vi } from 'vitest';

import { auth } from '@/_auth';
import { sendEmailChangeEmail } from '@/_auth/emails';
import { User } from '@/_models/user';
import { env } from '@/env';

import { requestEmailChange } from './requestEmailChange';

const mockDbFindOne = vi.hoisted(() => vi.fn());

vi.mock('next/headers', async () => await import('@mocks/next/headers'));

vi.mock('@/_auth', () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
	mongoClient: {
		db: vi.fn(() => ({
			collection: vi.fn(() => ({
				findOne: mockDbFindOne,
			})),
		})),
	},
}));

vi.mock('@/_models/user', async () => await import('@mocks/@/_models/user'));

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
	save: vi.fn().mockResolvedValue(undefined),
	...overrides,
});

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
			mockDbFindOne.mockResolvedValueOnce({ _id: 'other-user' });

			const result = await requestEmailChange('taken@example.com');

			expect(result).toEqual({
				ok: false,
				error: 'An account with that email already exists.',
			});
		});
	});

	describe('user lookup', () => {
		test('returns error when user is not found in app database', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(
				mockSession as never,
			);
			mockDbFindOne.mockResolvedValueOnce(null);
			vi.mocked(User.findOne).mockReturnValueOnce({
				exec: vi.fn().mockResolvedValue(null),
			} as never);

			const result = await requestEmailChange('new@example.com');

			expect(result).toEqual({ ok: false, error: 'User not found.' });
		});
	});

	describe('success', () => {
		test('returns success with hadPreviousRequest false when no existing pending change', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(
				mockSession as never,
			);
			mockDbFindOne.mockResolvedValueOnce(null);
			const mockUser = makeMockUser({ pendingEmailChange: null });
			vi.mocked(User.findOne).mockReturnValueOnce({
				exec: vi.fn().mockResolvedValue(mockUser),
			} as never);

			const result = await requestEmailChange('new@example.com');

			expect(result).toEqual({ ok: true, data: { hadPreviousRequest: false } });
		});

		test('returns success with hadPreviousRequest true when a pending change existed', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(
				mockSession as never,
			);
			mockDbFindOne.mockResolvedValueOnce(null);
			const mockUser = makeMockUser({
				pendingEmailChange: {
					email: 'old-pending@example.com',
					token: 'old-token',
					expiresAt: new Date(),
				},
			});
			vi.mocked(User.findOne).mockReturnValueOnce({
				exec: vi.fn().mockResolvedValue(mockUser),
			} as never);

			const result = await requestEmailChange('new@example.com');

			expect(result).toEqual({ ok: true, data: { hadPreviousRequest: true } });
		});
	});

	describe('side effects', () => {
		test('saves pending email change with 64-char hex token and 24-hour expiry', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(
				mockSession as never,
			);
			mockDbFindOne.mockResolvedValueOnce(null);
			const mockUser = makeMockUser();
			vi.mocked(User.findOne).mockReturnValueOnce({
				exec: vi.fn().mockResolvedValue(mockUser),
			} as never);

			const before = Date.now();
			await requestEmailChange('new@example.com');
			const after = Date.now();

			expect(mockUser.pendingEmailChange).toBeDefined();
			// biome-ignore lint/style/noNonNullAssertion: asserted defined above
			expect(mockUser.pendingEmailChange!.email).toBe('new@example.com');
			// biome-ignore lint/style/noNonNullAssertion: asserted defined above
			expect(mockUser.pendingEmailChange!.token).toMatch(/^[0-9a-f]{64}$/);
			// biome-ignore lint/style/noNonNullAssertion: asserted defined above
			const expiresAt = mockUser.pendingEmailChange!.expiresAt.getTime();
			expect(expiresAt).toBeGreaterThanOrEqual(before + 24 * 60 * 60 * 1000);
			expect(expiresAt).toBeLessThanOrEqual(after + 24 * 60 * 60 * 1000);
			expect(mockUser.save).toHaveBeenCalledOnce();
		});

		test('sends verification email to the new address with the stored token in the url', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(
				mockSession as never,
			);
			mockDbFindOne.mockResolvedValueOnce(null);
			const mockUser = makeMockUser();
			vi.mocked(User.findOne).mockReturnValueOnce({
				exec: vi.fn().mockResolvedValue(mockUser),
			} as never);

			await requestEmailChange('new@example.com');

			// biome-ignore lint/style/noNonNullAssertion: set by requestEmailChange
			const storedToken = mockUser.pendingEmailChange!.token;
			expect(vi.mocked(sendEmailChangeEmail)).toHaveBeenCalledWith({
				newEmail: 'new@example.com',
				url: `${env.BETTER_AUTH_URL}/verify-email-change?token=${storedToken}`,
			});
		});
	});
});
