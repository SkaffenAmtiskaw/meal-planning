import { afterEach, describe, expect, test, vi } from 'vitest';

import { User } from '@/_models';

import { verifyEmailChange } from './verifyEmailChange';

const { mockUpdateOne, mockCollection } = vi.hoisted(() => {
	const mockUpdateOne = vi.fn();
	return {
		mockUpdateOne,
		mockCollection: vi.fn(() => ({ updateOne: mockUpdateOne })),
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

describe('verifyEmailChange', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('returns error when token is not found', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(null),
		} as never);

		const result = await verifyEmailChange('bad-token');

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

		const result = await verifyEmailChange('valid-token');

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

		const result = await verifyEmailChange('expired-token');

		expect(result).toEqual({
			ok: false,
			error: 'This link is invalid or has expired.',
		});
	});

	test('updates email in better-auth user collection', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(makeMockUser()),
		} as never);
		mockUpdateOne.mockResolvedValue({});
		vi.mocked(User.updateOne).mockResolvedValueOnce({} as never);

		await verifyEmailChange('valid-token');

		expect(mockCollection).toHaveBeenCalledWith('user');
		expect(mockUpdateOne).toHaveBeenCalledWith(
			{ email: 'user@example.com' },
			{ $set: { email: 'new@example.com' } },
		);
	});

	test('updates app User model and clears pending change', async () => {
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(makeMockUser()),
		} as never);
		mockUpdateOne.mockResolvedValue({});
		vi.mocked(User.updateOne).mockResolvedValueOnce({} as never);

		await verifyEmailChange('valid-token');

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
		mockUpdateOne.mockResolvedValue({});
		vi.mocked(User.updateOne).mockResolvedValueOnce({} as never);

		const result = await verifyEmailChange('valid-token');

		expect(result).toEqual({ ok: true, data: undefined });
	});
});
