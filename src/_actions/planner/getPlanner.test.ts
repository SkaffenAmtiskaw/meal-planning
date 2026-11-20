import { afterEach, describe, expect, test, vi } from 'vitest';

import { planners } from '@/_models/database/planners';

import { getPlanner } from './getPlanner';

vi.mock(
	'@/_models/database/planners',
	async () => await import('#mocks/@/_models/database/planners'),
);

describe('getPlanner', () => {
	const mockId = 'planner-1';

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('should return the planner when found', async () => {
		const mockPlanner = {
			_id: mockId,
			name: "Ursula's Planner",
			calendar: [],
			saved: [],
			tags: [],
		};
		vi.mocked(planners.findOne).mockResolvedValue(mockPlanner);

		const result = await getPlanner(mockId);

		expect(planners.findOne).toHaveBeenCalledWith({ _id: mockId });
		expect(result).toBe(mockPlanner);
	});

	test('should throw when the planner is not found', async () => {
		vi.mocked(planners.findOne).mockResolvedValue(null);

		await expect(getPlanner(mockId)).rejects.toThrow(
			`Planner ${mockId} not found`,
		);
	});

	test('should throw when the read fails', async () => {
		vi.mocked(planners.findOne).mockRejectedValue(new Error('DB error'));

		await expect(getPlanner(mockId)).rejects.toThrow('DB error');
	});
});
