/**
 * Shared mock for @/_actions/user.
 *
 * Usage in a test file:
 *   vi.mock('@/_actions/user', async () => await import('@mocks/@/_actions/user'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(getUser).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

export const addUser = vi.fn(async () => ({
	email: 'user@example.com',
	name: 'Test User',
	planners: [
		{ planner: '507f1f77bcf86cd799439011', accessLevel: 'owner' as const },
	],
}));

export const deleteAccount = vi.fn(async () => ({
	ok: true as const,
	data: undefined,
}));

export const getUser = vi.fn(async () => ({
	_id: 'user-id',
	email: 'user@example.com',
	name: 'Test User',
	planners: [{ planner: '507f1f77bcf86cd799439011', accessLevel: 'owner' }],
}));

export const requestEmailChange = vi.fn(async () => ({
	ok: true as const,
	data: { hadPreviousRequest: false },
}));

export const updateUserName = vi.fn(async () => ({
	ok: true as const,
	data: undefined,
}));

export const verifyEmailChange = vi.fn(async () => ({
	ok: true as const,
	data: undefined,
}));

export const verifyEmailChangeAndSetPassword = vi.fn(async () => ({
	ok: true as const,
	data: undefined,
}));
