/**
 * Shared mock for @/_models/database/pendingInvites.
 *
 * Usage in a test file:
 *   vi.mock('@/_models/database/pendingInvites', async () => await import('#mocks/@/_models/database/pendingInvites'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(pendingInvites.findOne).mockResolvedValueOnce(invite as never)` for a filter that matches an invite.
 */

import { vi } from 'vitest';

export const pendingInvites = {
	countDocuments: vi.fn(async () => 0),
	deleteOne: vi.fn(async () => ({ deletedCount: 1 })),
	find: vi.fn(() => ({
		sort: () => ({ toArray: async () => [] }),
		toArray: async () => [],
	})),
	findOne: vi.fn(),
	insertOne: vi.fn(),
	updateOne: vi.fn(async () => ({ matchedCount: 1 })),
};
