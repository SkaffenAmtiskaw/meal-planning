import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { User } from '@/_models/user';

import { verifyEmailChange } from './verifyEmailChange';

const { mockUpdateOne, mockCollection } = vi.hoisted(() => {
	const mockUpdateOne = vi.fn();
	return {
		mockUpdateOne,
		mockCollection: vi.fn(() => ({ updateOne: mockUpdateOne })),
	};
});

vi.mock('@/_auth', async () => ({
	mongoClient: {
		db: vi.fn(() => ({ collection: mockCollection })),
	},
}));

vi.mock('@/_models/user', async () => await import('@mocks/@/_models/user'));

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

const setupValidUser = () => {
	vi.mocked(User.findOne as any).mockReturnValueOnce({
		exec: vi.fn().mockResolvedValue(makeMockUser()),
	});
	mockUpdateOne.mockResolvedValueOnce({});
	vi.mocked(User.updateOne as any).mockResolvedValueOnce({});
};

describe('verifyEmailChange', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('validation', () => {
		test('returns an invalid link error when no user has the given token', async () => {
			vi.mocked(User.findOne as any).mockReturnValueOnce({
				exec: vi.fn().mockResolvedValue(null),
			});

			const result = await verifyEmailChange('bad-token');

			expect(result).toEqual({
				ok: false,
				error: 'This link is invalid or has expired.',
			});
		});

		test('returns an invalid link error when the user has no pending email change', async () => {
			vi.mocked(User.findOne as any).mockReturnValueOnce({
				exec: vi
					.fn()
					.mockResolvedValue(makeMockUser({ pendingEmailChange: null })),
			});

			const result = await verifyEmailChange('valid-token');

			expect(result).toEqual({
				ok: false,
				error: 'This link is invalid or has expired.',
			});
		});

		test('returns an invalid link error when the token has expired', async () => {
			vi.mocked(User.findOne as any).mockReturnValueOnce({
				exec: vi.fn().mockResolvedValue(
					makeMockUser({
						pendingEmailChange: {
							email: 'new@example.com',
							token: 'expired-token',
							expiresAt: pastDate,
						},
					}),
				),
			});

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

		test('updates the email in the better-auth user collection', async () => {
			await verifyEmailChange('valid-token');

			expect(mockCollection).toHaveBeenCalledWith('user');
			expect(mockUpdateOne).toHaveBeenCalledWith(
				{ email: 'user@example.com' },
				{ $set: { email: 'new@example.com' } },
			);
		});

		test('updates the app User model and clears the pending change', async () => {
			await verifyEmailChange('valid-token');

			expect(User.updateOne).toHaveBeenCalledWith(
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
