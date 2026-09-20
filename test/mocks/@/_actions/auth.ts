/**
 * Shared mock for @/_actions/auth.
 *
 * Usage in a test file:
 *   vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(checkAuth).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

export const checkAuth = vi.fn(async () => ({
	type: 'authorized' as const,
	accessLevel: 'owner' as const,
	user: {
		_id: 'user-id',
		email: 'user@example.com',
		name: 'Test User',
		planners: [{ planner: '507f1f77bcf86cd799439011', accessLevel: 'owner' }],
	},
}));

export const checkEmailStatus = vi.fn(async () => 'new' as const);
