import { afterEach, describe, expect, test, vi } from 'vitest';

import { User } from '@/_models';

import { verifyEmailChangeAndSetPassword } from './verifyEmailChangeAndSetPassword';

const {
	mockFindOne,
	mockInsertOne,
	mockUpdateOne,
	mockCollection,
	mockHashPassword,
} = vi.hoisted(() => {
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
		mockHashPassword: vi.fn(),
	};
});

vi.mock('@/_auth', () => ({
	mongoClient: {
		db: vi.fn(() => ({ collection: mockCollection })),
	},
}));

vi.mock('@/_models', () => ({
	User: {
		findOne: vi.fn(),
		updateOne: vi.fn(),
	},
}));

vi.mock('better-auth/crypto', () => ({
	hashPassword: (pw: string) => mockHashPassword(pw),
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

describe('verifyEmailChangeAndSetPassword', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('returns error when password is too short', async () => {
		const result = await verifyEmailChangeAndSetPassword('token', 'short');

		expect(result).toEqual({
			ok: false,
			error: 'Password must be at least 8 characters.',
		});
	});

	test('returns error when token is not found', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(null),
		} as never);

		const result = await verifyEmailChangeAndSetPassword(
			'bad-token',
			'password123',
		);

		expect(result).toEqual({
			ok: false,
			error: 'This link is invalid or has expired.',
		});
	});

	test('returns error when pending change is missing', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi
				.fn()
				.mockResolvedValue(makeMockUser({ pendingEmailChange: null })),
		} as never);

		const result = await verifyEmailChangeAndSetPassword(
			'valid-token',
			'password123',
		);

		expect(result).toEqual({
			ok: false,
			error: 'This link is invalid or has expired.',
		});
	});

	test('returns error when token is expired', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(
				makeMockUser({
					pendingEmailChange: {
						email: 'new@example.com',
						token: 'expired-token',
						expiresAt: pastDate,
					},
				}),
			),
		} as never);

		const result = await verifyEmailChangeAndSetPassword(
			'expired-token',
			'password123',
		);

		expect(result).toEqual({
			ok: false,
			error: 'This link is invalid or has expired.',
		});
	});

	test('returns error when better-auth user not found', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(makeMockUser()),
		} as never);
		mockFindOne.mockResolvedValueOnce(null);

		const result = await verifyEmailChangeAndSetPassword(
			'valid-token',
			'password123',
		);

		expect(result).toEqual({ ok: false, error: 'User not found.' });
	});

	test('inserts credential account with hashed password', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(makeMockUser()),
		} as never);
		const baUser = { _id: 'ba-user-id' };
		mockFindOne.mockResolvedValueOnce(baUser);
		mockHashPassword.mockResolvedValueOnce('hashed-password');
		mockInsertOne.mockResolvedValueOnce({});
		mockUpdateOne.mockResolvedValue({});
		vi.mocked(User.updateOne).mockResolvedValueOnce({} as never);

		await verifyEmailChangeAndSetPassword('valid-token', 'password123');

		expect(mockHashPassword).toHaveBeenCalledWith('password123');
		expect(mockInsertOne).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: 'ba-user-id',
				providerId: 'credential',
				password: 'hashed-password',
			}),
		);
	});

	test('updates email in better-auth user collection', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(makeMockUser()),
		} as never);
		const baUser = { _id: 'ba-user-id' };
		mockFindOne.mockResolvedValueOnce(baUser);
		mockHashPassword.mockResolvedValueOnce('hashed-password');
		mockInsertOne.mockResolvedValueOnce({});
		mockUpdateOne.mockResolvedValue({});
		vi.mocked(User.updateOne).mockResolvedValueOnce({} as never);

		await verifyEmailChangeAndSetPassword('valid-token', 'password123');

		expect(mockUpdateOne).toHaveBeenCalledWith(
			{ _id: 'ba-user-id' },
			{ $set: { email: 'new@example.com' } },
		);
	});

	test('updates app User model and clears pending change', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(makeMockUser()),
		} as never);
		const baUser = { _id: 'ba-user-id' };
		mockFindOne.mockResolvedValueOnce(baUser);
		mockHashPassword.mockResolvedValueOnce('hashed-password');
		mockInsertOne.mockResolvedValueOnce({});
		mockUpdateOne.mockResolvedValue({});
		vi.mocked(User.updateOne).mockResolvedValueOnce({} as never);

		await verifyEmailChangeAndSetPassword('valid-token', 'password123');

		expect(User.updateOne).toHaveBeenCalledWith(
			{ email: 'user@example.com' },
			{
				$set: { email: 'new@example.com' },
				$unset: { pendingEmailChange: '' },
			},
		);
	});

	test('returns success', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(makeMockUser()),
		} as never);
		mockFindOne.mockResolvedValueOnce({ _id: 'ba-user-id' });
		mockHashPassword.mockResolvedValueOnce('hashed-password');
		mockInsertOne.mockResolvedValueOnce({});
		mockUpdateOne.mockResolvedValue({});
		vi.mocked(User.updateOne).mockResolvedValueOnce({} as never);

		const result = await verifyEmailChangeAndSetPassword(
			'valid-token',
			'password123',
		);

		expect(result).toEqual({ ok: true, data: undefined });
	});
});
