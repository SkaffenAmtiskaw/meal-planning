/**
 * Shared mock for @/_actions/planner/getPlanner.
 *
 * Usage in a test file:
 *   vi.mock('@/_actions/planner/getPlanner', async () => await import('#mocks/@/_actions/planner/getPlanner'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(getPlanner).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

import type * as GetPlanner from '@/_actions/planner/getPlanner';

export const getPlanner = vi.fn<typeof GetPlanner.getPlanner>(async () => ({
	_id: '507f1f77bcf86cd799439011',
	name: "Test User's Planner",
	calendar: [],
	saved: [],
	tags: [],
}));
