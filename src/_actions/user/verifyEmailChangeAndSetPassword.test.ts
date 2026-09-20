import { hashPassword } from 'better-auth/crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { User } from '@/_models/user';

import { verifyEmailChangeAndSetPassword } from './verifyEmailChangeAndSetPassword';

const { mockFindOne, mockInsertOne, mockUpdateOne, mockCollection } =
	vi.hoisted(() => {
		const mockFindOne = vi.fn();
		const mockInsertOne = vi.fn();
		const mockUpdateOne = vi.fn();
		return {
			mockFindOne,
			mockInsertOne,
			mockUpdateOne,
			mockCollection: vi.fn(() => ({
				findOne: mockFindOne,
				insertOne: mockInsertOne,
				updateOne: mockUpdateOne,
			})),
		};
	});

vi.mock('@/_auth', async () => ({
	mongoClient: {
		db: vi.fn(() => ({ collection: mockCollection })),
	},
}));

vi.mock('@/_models/user', async () => ({
	User: {
		findOne: vi.fn(() => ({ exec: vi.fn() })),
		updateOne: vi.fn(),
	},
}));

vi.mock('better-auth/crypto', async () => ({
	hashPassword: vi.fn(),
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
	mockFindOne.mockResolvedValueOnce({ _id: 'ba-user-id' });
	vi.mocked(hashPassword).mockResolvedValueOnce('hashed-password');
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
			mockFindOne.mockResolvedValueOnce(null);

			const result = await verifyEmailChangeAndSetPassword(
				'valid-token',
				'password123',
			);

			expect(result).toEqual({ ok: false, error: 'User not found.' });
		});
	});

	describe('success', () => {
		it('inserts a credential account with the hashed password', async () => {
			setupHappyPath();

			await verifyEmailChangeAndSetPassword('valid-token', 'password123');

			expect(hashPassword).toHaveBeenCalledWith('password123');
			expect(mockInsertOne).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 'ba-user-id',
					providerId: 'credential',
					password: 'hashed-password',
				}),
			);
		});

		it('updates the email in the better-auth user collection', async () => {
			setupHappyPath();

			await verifyEmailChangeAndSetPassword('valid-token', 'password123');

			expect(mockUpdateOne).toHaveBeenCalledWith(
				{ _id: 'ba-user-id' },
				{ $set: { email: 'new@example.com' } },
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
