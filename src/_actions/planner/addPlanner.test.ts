import { afterEach, describe, expect, test, vi } from 'vitest';

import { Planner } from '@/_models';

import { addPlanner } from './addPlanner';

vi.mock('@/_models', () => ({
	Planner: {
		create: vi.fn(),
	},
}));

describe('addPlanner', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('should create and return a new planner with empty arrays', async () => {
		const mockPlanner = { calendar: [], saved: [], tags: [] };
		vi.mocked(Planner.create).mockResolvedValue(mockPlanner as never);

		const result = await addPlanner();

		expect(Planner.create).toHaveBeenCalledWith({
			calendar: [],
			saved: [],
			tags: [],
		});
		expect(result).toBe(mockPlanner);
	});

	test('should throw when Planner.create fails', async () => {
		vi.mocked(Planner.create).mockRejectedValue(new Error('DB error'));

		await expect(addPlanner()).rejects.toThrow('DB error');
	});
});
