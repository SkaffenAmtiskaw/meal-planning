/**
 * Shared mock for @/_models/database/users.
 *
 * Usage in a test file:
 *   vi.mock('@/_models/database/users', async () => await import('#mocks/@/_models/database/users'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(users.updateOne).mockResolvedValueOnce({ matchedCount: 0 } as never)` for a filter that matches nothing.
 */

import { vi } from 'vitest';

export const users = {
	countDocuments: vi.fn(async () => 0),
	deleteMany: vi.fn(async () => ({ deletedCount: 0 })),
	deleteOne: vi.fn(async () => ({ deletedCount: 1 })),
	find: vi.fn(() => ({ toArray: async () => [] })),
	findOne: vi.fn(),
	insertOne: vi.fn(),
	updateMany: vi.fn(async () => ({ matchedCount: 0 })),
	updateOne: vi.fn(async () => ({ matchedCount: 1 })),
};
