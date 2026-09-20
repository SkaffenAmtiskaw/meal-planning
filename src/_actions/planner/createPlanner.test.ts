import { afterEach, describe, expect, it, vi } from 'vitest';

import { User } from '@/_models/user';
import { catchify } from '@/_utils/catchify';

import { addPlanner } from './addPlanner';
import { createPlanner } from './createPlanner';

const mockSafeParse = vi.hoisted(() => vi.fn());

vi.mock('@/_actions/user', async () => await import('@mocks/@/_actions/user'));
vi.mock('@/_models/user', async () => await import('@mocks/@/_models/user'));
vi.mock('./addPlanner', async () => ({
	addPlanner: vi.fn(),
}));
vi.mock('@/_utils/catchify', async () => ({
	catchify: vi.fn(),
}));
vi.mock('@/_utils/zSafeString', async () => ({
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

	it('returns an error when name validation fails', async () => {
		mockSafeParse.mockReturnValue({
			success: false,
			error: { issues: [{ message: 'Must be at least 1 character' }] },
		});

		const result = await createPlanner('');

		expect(result).toEqual({
			ok: false,
			error: 'Must be at least 1 character',
		});
	});

	it('returns an error when name contains invalid characters', async () => {
		mockSafeParse.mockReturnValue({
			success: false,
			error: { issues: [{ message: 'Contains invalid characters' }] },
		});

		const result = await createPlanner('Planner <script>');

		expect(result).toEqual({ ok: false, error: 'Contains invalid characters' });
	});

	it('returns an error when the user is not authenticated', async () => {
		mockSafeParse.mockReturnValue({
			success: true,
			data: 'My Planner',
		});
		vi.mocked(catchify).mockResolvedValue([
			undefined,
			new Error('No Valid Session'),
		]);

		const result = await createPlanner('My Planner');

		expect(result).toEqual({ ok: false, error: 'Not authenticated.' });
	});

	it('creates a planner and links it to the user', async () => {
		mockSafeParse.mockReturnValue({
			success: true,
			data: 'My Planner',
		});
		vi.mocked(catchify).mockResolvedValue([mockUser]);
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

	it('propagates errors from addPlanner', async () => {
		mockSafeParse.mockReturnValue({
			success: true,
			data: 'My Planner',
		});
		vi.mocked(catchify).mockResolvedValue([mockUser]);
		vi.mocked(addPlanner).mockRejectedValue(new Error('DB error'));

		await expect(createPlanner('My Planner')).rejects.toThrow('DB error');
	});
});
