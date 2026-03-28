import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Planner } from '@/_models';

import { getPlanner } from './getPlanner';

vi.mock('@/_models', () => ({
	Planner: {
		findById: vi.fn(),
	},
}));

describe('getPlanner', () => {
	const mockId = new Types.ObjectId();

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('should return the planner when found', async () => {
		const mockPlanner = { _id: mockId, calendar: [], saved: [], tags: [] };
		vi.mocked(Planner.findById).mockResolvedValue(mockPlanner);

		const result = await getPlanner(mockId);

		expect(Planner.findById).toHaveBeenCalledWith(mockId);
		expect(result).toBe(mockPlanner);
	});

	test('should throw when the planner is not found', async () => {
		vi.mocked(Planner.findById).mockResolvedValue(null);

		await expect(getPlanner(mockId)).rejects.toThrow(
			`Planner ${mockId} not found`,
		);
	});

	test('should throw when Planner.findById fails', async () => {
		vi.mocked(Planner.findById).mockRejectedValue(new Error('DB error'));

		await expect(getPlanner(mockId)).rejects.toThrow('DB error');
	});
});
