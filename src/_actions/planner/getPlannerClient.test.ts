import { afterEach, describe, expect, test, vi } from 'vitest';

import { getPlannerClient } from './getPlannerClient';

const mockGetPlanner = vi.fn();
vi.mock('./getPlanner', () => ({
	getPlanner: (...args: unknown[]) => mockGetPlanner(...args),
}));

describe('getPlannerClient', () => {
	const mockId = 'planner-1';

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('returns the planner', async () => {
		mockGetPlanner.mockResolvedValue({
			_id: mockId,
			calendar: [{ date: '2026-11-17', meals: [] }],
			saved: [],
			tags: [{ _id: 'tag-1', name: 'tag', color: 'red' }],
		});

		const result = await getPlannerClient(mockId);

		expect(mockGetPlanner).toHaveBeenCalledWith(mockId);
		expect(result).toEqual({
			_id: mockId,
			calendar: [{ date: '2026-11-17', meals: [] }],
			saved: [],
			tags: [{ _id: 'tag-1', name: 'tag', color: 'red' }],
		});
	});

	test('propagates errors from getPlanner', async () => {
		mockGetPlanner.mockRejectedValue(new Error('not found'));

		await expect(getPlannerClient(mockId)).rejects.toThrow('not found');
	});
});
