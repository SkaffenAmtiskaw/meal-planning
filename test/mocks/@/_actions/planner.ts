/**
 * Shared mock for @/_actions/planner.
 *
 * Usage in a test file:
 *   vi.mock('@/_actions/planner', async () => await import('@mocks/@/_actions/planner'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(getPlanner).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

export const addPlanner = vi.fn(async () => ({
	_id: { toString: () => '507f1f77bcf86cd799439011' },
	name: "Test User's Planner",
	calendar: [],
	saved: [],
	tags: [],
}));

export const createPlanner = vi.fn(async () => ({
	ok: true as const,
	data: undefined,
}));

export const getPlanner = vi.fn(async () => ({
	_id: { toString: () => '507f1f77bcf86cd799439011' },
	name: "Test User's Planner",
	calendar: [],
	saved: [],
	tags: [],
}));

export const getPlannerClient = vi.fn(async () => ({
	_id: '507f1f77bcf86cd799439011',
	name: "Test User's Planner",
	calendar: [],
	saved: [],
	tags: [],
}));

export const getPlanners = vi.fn(async () => [
	{
		planner: {
			_id: { toString: () => '507f1f77bcf86cd799439011' },
			name: "Test User's Planner",
			calendar: [],
			saved: [],
			tags: [],
		},
		accessLevel: 'owner' as const,
	},
]);

export const updatePlannerName = vi.fn(async () => ({
	ok: true as const,
	data: undefined,
}));
