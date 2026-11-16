/**
 * Shared mock for @/_models/database/planners.
 *
 * Usage in a test file:
 *   vi.mock('@/_models/database/planners', async () => await import('#mocks/@/_models/database/planners'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(planners.updateOne).mockResolvedValueOnce({ matchedCount: 0 } as never)` for a filter that matches
 * nothing.
 */

import { vi } from 'vitest';

export const planners = {
	countDocuments: vi.fn(async () => 0),
	deleteOne: vi.fn(async () => ({ deletedCount: 1 })),
	find: vi.fn(() => ({ toArray: async () => [] })),
	findOne: vi.fn(),
	insertOne: vi.fn(),
	updateOne: vi.fn(async () => ({ matchedCount: 1 })),
};
