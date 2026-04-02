import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkEmailStatus } from './checkEmailStatus';

const mockFindOne = vi.fn();
const mockCollection = vi.fn(() => ({ findOne: mockFindOne }));

vi.mock('@/_auth', () => ({
	mongoClient: {
		db: vi.fn(() => ({ collection: mockCollection })),
	},
}));

describe('checkEmailStatus', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('returns "new" when user does not exist', async () => {
		mockFindOne.mockResolvedValueOnce(null);

		const result = await checkEmailStatus('unknown@example.com');

		expect(result).toBe('new');
		expect(mockCollection).toHaveBeenCalledWith('user');
	});

	test('returns "has-password" when user has a credential account', async () => {
		const mockUser = { _id: 'user-id-123', email: 'user@example.com' };
		mockFindOne.mockResolvedValueOnce(mockUser).mockResolvedValueOnce({
			providerId: 'credential',
			userId: 'user-id-123',
		});

		const result = await checkEmailStatus('user@example.com');

		expect(result).toBe('has-password');
		expect(mockCollection).toHaveBeenCalledWith('account');
		expect(mockFindOne).toHaveBeenCalledWith({
			userId: mockUser._id,
			providerId: 'credential',
		});
	});

	test('returns "social-only" when user exists but has no credential account', async () => {
		const mockUser = { _id: 'user-id-456', email: 'google@example.com' };
		mockFindOne.mockResolvedValueOnce(mockUser).mockResolvedValueOnce(null);

		const result = await checkEmailStatus('google@example.com');

		expect(result).toBe('social-only');
	});
});
