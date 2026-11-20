/**
 * Shared mock for @/_actions/_utils/addPlanner.
 *
 * Usage in a test file:
 *   vi.mock('@/_actions/_utils/addPlanner', async () => await import('#mocks/@/_actions/_utils/addPlanner'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(addPlanner).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

export const addPlanner = vi.fn(async () => ({
	_id: '507f1f77bcf86cd799439011',
	name: "Test User's Planner",
	calendar: [],
	saved: [],
	tags: [],
}));
