import { afterEach, describe, expect, test, vi } from 'vitest';

import { notFound } from 'next/navigation';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { planners } from '@/_models/database/planners';

import { getPlanner } from './getPlanner';

vi.mock(
	'@/_models/database/planners',
	async () => await import('#mocks/@/_models/database/planners'),
);
vi.mock(
	'@/_actions/auth/checkAuth',
	async () => await import('#mocks/@/_actions/auth/checkAuth'),
);
vi.mock('next/navigation', async () => await import('#mocks/next/navigation'));

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

		expect(checkAuth).toHaveBeenCalledWith(mockId, 'read');
		expect(planners.findOne).toHaveBeenCalledWith({ _id: mockId });
		expect(result).toBe(mockPlanner);
	});

	test('should not find the planner for a non-member', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthorized' });

		await getPlanner(mockId);

		expect(notFound).toHaveBeenCalled();
		expect(planners.findOne).not.toHaveBeenCalled();
	});

	test('should not find the planner for a signed-out caller', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthenticated' });

		await getPlanner(mockId);

		expect(notFound).toHaveBeenCalled();
		expect(planners.findOne).not.toHaveBeenCalled();
	});

	test('should throw when the access check fails', async () => {
		const error = new Error('Auth error');
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'error', error });

		await expect(getPlanner(mockId)).rejects.toBe(error);
		expect(planners.findOne).not.toHaveBeenCalled();
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
