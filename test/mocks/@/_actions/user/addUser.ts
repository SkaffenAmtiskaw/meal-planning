/**
 * Shared mock for @/_actions/user/addUser.
 *
 * Usage in a test file:
 *   vi.mock('@/_actions/user/addUser', async () => await import('#mocks/@/_actions/user/addUser'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(addUser).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

export const addUser = vi.fn(async () => ({
	email: 'user@example.com',
	name: 'Test User',
	planners: [
		{ planner: '507f1f77bcf86cd799439011', accessLevel: 'owner' as const },
	],
}));
