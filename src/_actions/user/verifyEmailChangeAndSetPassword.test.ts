import { afterEach, describe, expect, it, vi } from 'vitest';

import { auth } from '@/_auth';
import { addAuthUserPassword, changeAuthUserEmail } from '@/_auth/users';
import { User } from '@/_models/user';

import { verifyEmailChangeAndSetPassword } from './verifyEmailChangeAndSetPassword';

vi.mock('@/_auth', () => ({ auth: {} }));

vi.mock('@/_auth/users', async () => await import('#mocks/@/_auth/users'));

vi.mock('@/_models/user', async () => ({
	User: {
		findOne: vi.fn(() => ({ exec: vi.fn() })),
		updateOne: vi.fn(),
	},
}));

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

const mockUserFindOneResult = (user: unknown) => {
	vi.mocked(User.findOne).mockReturnValueOnce({
		exec: vi.fn().mockResolvedValue(user),
	} as never);
};

const setupHappyPath = () => {
	mockUserFindOneResult(makeMockUser());
};

describe('verifyEmailChangeAndSetPassword', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('password validation', () => {
		it('returns an error when the password is too short', async () => {
			const result = await verifyEmailChangeAndSetPassword('token', 'short');

			expect(result).toEqual({
				ok: false,
				error: 'Password must be at least 8 characters.',
			});
		});
	});

	describe('token verification', () => {
		it('returns an error when the token is not found', async () => {
			mockUserFindOneResult(null);

			const result = await verifyEmailChangeAndSetPassword(
				'bad-token',
				'password123',
			);

			expect(result).toEqual({
				ok: false,
				error: 'This link is invalid or has expired.',
			});
		});

		it('returns an error when the pending change is missing', async () => {
			mockUserFindOneResult(makeMockUser({ pendingEmailChange: null }));

			const result = await verifyEmailChangeAndSetPassword(
				'valid-token',
				'password123',
			);

			expect(result).toEqual({
				ok: false,
				error: 'This link is invalid or has expired.',
			});
		});

		it('returns an error when the token is expired', async () => {
			mockUserFindOneResult(
				makeMockUser({
					pendingEmailChange: {
						email: 'new@example.com',
						token: 'expired-token',
						expiresAt: pastDate,
					},
				}),
			);

			const result = await verifyEmailChangeAndSetPassword(
				'expired-token',
				'password123',
			);

			expect(result).toEqual({
				ok: false,
				error: 'This link is invalid or has expired.',
			});
		});
	});

	describe('user lookup', () => {
		it('returns an error when the better-auth user is not found', async () => {
			mockUserFindOneResult(makeMockUser());
			vi.mocked(addAuthUserPassword).mockResolvedValueOnce(false);

			const result = await verifyEmailChangeAndSetPassword(
				'valid-token',
				'password123',
			);

			expect(result).toEqual({ ok: false, error: 'User not found.' });
			expect(changeAuthUserEmail).not.toHaveBeenCalled();
			expect(User.updateOne).not.toHaveBeenCalled();
		});
	});

	describe('success', () => {
		it('adds the password to the better-auth user found by the current email', async () => {
			setupHappyPath();

			await verifyEmailChangeAndSetPassword('valid-token', 'password123');

			expect(addAuthUserPassword).toHaveBeenCalledWith(
				auth,
				'user@example.com',
				'password123',
			);
		});

		it("changes the better-auth user's email", async () => {
			setupHappyPath();

			await verifyEmailChangeAndSetPassword('valid-token', 'password123');

			expect(changeAuthUserEmail).toHaveBeenCalledWith(
				auth,
				'user@example.com',
				'new@example.com',
			);
		});

		it('updates the app User model and clears the pending change', async () => {
			setupHappyPath();

			await verifyEmailChangeAndSetPassword('valid-token', 'password123');

			expect(User.updateOne).toHaveBeenCalledWith(
				{ email: 'user@example.com' },
				{
					$set: { email: 'new@example.com' },
					$unset: { pendingEmailChange: '' },
				},
			);
		});

		it('returns success', async () => {
			setupHappyPath();

			const result = await verifyEmailChangeAndSetPassword(
				'valid-token',
				'password123',
			);

			expect(result).toEqual({ ok: true, data: undefined });
		});
	});
});
