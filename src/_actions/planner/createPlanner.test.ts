import { afterEach, describe, expect, test, vi } from 'vitest';

import { User } from '@/_models';

import { addPlanner } from './addPlanner';
import { createPlanner } from './createPlanner';

const mockGetUser = vi.hoisted(() => vi.fn());
vi.mock('@/_actions/user', () => ({
	getUser: mockGetUser,
}));

vi.mock('./addPlanner', () => ({
	addPlanner: vi.fn(),
}));

vi.mock('@/_models', () => ({
	User: {
		collection: {
			updateOne: vi.fn(),
		},
	},
}));

const mockUser = { _id: 'user-id-123', planners: [] };
const mockPlanner = { _id: 'planner-id-456', name: 'My Planner' };

describe('createPlanner', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('returns error when name is empty', async () => {
		const result = await createPlanner('');

		expect(result).toEqual({ ok: false, error: expect.any(String) });
	});

	test('returns error when name contains invalid characters', async () => {
		const result = await createPlanner('Planner <script>');

		expect(result).toEqual({ ok: false, error: expect.any(String) });
	});

	test('returns error when user is not authenticated', async () => {
		mockGetUser.mockRejectedValue(new Error('No Valid Session'));

		const result = await createPlanner('My Planner');

		expect(result).toEqual({ ok: false, error: 'Not authenticated.' });
	});

	test('creates planner and links it to user', async () => {
		mockGetUser.mockResolvedValue(mockUser);
		vi.mocked(addPlanner).mockResolvedValue(mockPlanner as never);
		vi.mocked(User.collection.updateOne).mockResolvedValue({} as never);

		const result = await createPlanner('My Planner');

		expect(addPlanner).toHaveBeenCalledWith('My Planner');
		expect(User.collection.updateOne).toHaveBeenCalledWith(
			{ _id: 'user-id-123' },
			{
				$push: {
					planners: { planner: 'planner-id-456', accessLevel: 'owner' },
				},
			},
		);
		expect(result).toEqual({ ok: true, data: undefined });
	});

	test('propagates error when addPlanner throws', async () => {
		mockGetUser.mockResolvedValue(mockUser);
		vi.mocked(addPlanner).mockRejectedValue(new Error('DB error'));

		await expect(createPlanner('My Planner')).rejects.toThrow('DB error');
	});
});
