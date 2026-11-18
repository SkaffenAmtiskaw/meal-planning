/**
 * Shared mock for @/_actions/sharing.
 *
 * Usage in a test file:
 *   vi.mock('@/_actions/sharing', async () => await import('#mocks/@/_actions/sharing'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(acceptInvite).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

import type * as Sharing from '@/_actions/sharing';

export const acceptInvite = vi.fn<typeof Sharing.acceptInvite>(async () => ({
	ok: true,
	data: { plannerId: '507f1f77bcf86cd799439011' },
}));

export const cancelInvite = vi.fn<typeof Sharing.cancelInvite>(async () => ({
	success: true,
}));

export const declineInvite = vi.fn<typeof Sharing.declineInvite>(async () => ({
	ok: true,
	data: undefined,
}));

export const getPendingInvites = vi.fn<typeof Sharing.getPendingInvites>(
	async () => ({
		invites: [],
	}),
);

export const getPlannerMembers = vi.fn<typeof Sharing.getPlannerMembers>(
	async () => ({
		members: [],
	}),
);

export const inviteUser = vi.fn<typeof Sharing.inviteUser>(async () => ({
	ok: true,
	data: { inviteId: '507f1f77bcf86cd799439012' },
}));

export const leavePlanner = vi.fn<typeof Sharing.leavePlanner>(async () => ({
	ok: true,
	data: undefined,
}));

export const removeMember = vi.fn<typeof Sharing.removeMember>(async () => ({
	ok: true,
}));

export const signUpWithInvite = vi.fn<typeof Sharing.signUpWithInvite>(
	async () => ({
		success: true,
		redirectUrl: '/',
	}),
);

export const updateMemberAccess = vi.fn<typeof Sharing.updateMemberAccess>(
	async () => ({ ok: true }),
);

export const validateInviteToken = vi.fn<typeof Sharing.validateInviteToken>(
	async () => ({
		valid: true,
		email: 'user@example.com',
		plannerName: "Test User's Planner",
	}),
);
