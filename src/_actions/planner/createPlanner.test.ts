import { afterEach, describe, expect, test, vi } from 'vitest';

import { User } from '@/_models';
import { catchify } from '@/_utils/catchify';

import { addPlanner } from './addPlanner';
import { createPlanner } from './createPlanner';

const mockSafeParse = vi.hoisted(() => vi.fn());

vi.mock('@/_actions/user', async () => await import('@mocks/@/_actions/user'));
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
vi.mock('@/_utils/catchify', () => ({
	catchify: vi.fn(),
}));
vi.mock('@/_utils/zSafeString', () => ({
	zSafeString: vi.fn(() => ({
		safeParse: mockSafeParse,
	})),
}));

const mockUser = { _id: 'user-id-123', planners: [] };
const mockPlanner = { _id: 'planner-id-456', name: 'My Planner' };

describe('createPlanner', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('returns error when name is empty', async () => {
		mockSafeParse.mockReturnValue({
			success: false,
			error: { issues: [{ message: 'Must be at least 1 character' }] },
		} as never);

		const result = await createPlanner('');

		expect(result).toEqual({
			ok: false,
			error: 'Must be at least 1 character',
		});
	});

	test('returns error when name contains invalid characters', async () => {
		mockSafeParse.mockReturnValue({
			success: false,
			error: { issues: [{ message: 'Contains invalid characters' }] },
		} as never);

		const result = await createPlanner('Planner <script>');

		expect(result).toEqual({ ok: false, error: 'Contains invalid characters' });
	});

	test('returns error when user is not authenticated', async () => {
		mockSafeParse.mockReturnValue({
			success: true,
			data: 'My Planner',
		} as never);
		vi.mocked(catchify).mockResolvedValue([
			undefined,
			new Error('No Valid Session'),
		] as never);

		const result = await createPlanner('My Planner');

		expect(result).toEqual({ ok: false, error: 'Not authenticated.' });
	});

	test('creates planner and links it to user', async () => {
		mockSafeParse.mockReturnValue({
			success: true,
			data: 'My Planner',
		} as never);
		vi.mocked(catchify).mockResolvedValue([mockUser] as never);
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
		mockSafeParse.mockReturnValue({
			success: true,
			data: 'My Planner',
		} as never);
		vi.mocked(catchify).mockResolvedValue([mockUser] as never);
		vi.mocked(addPlanner).mockRejectedValue(new Error('DB error'));

		await expect(createPlanner('My Planner')).rejects.toThrow('DB error');
	});
});
