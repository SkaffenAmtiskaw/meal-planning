/**
 * Shared mock for @/_actions/sharing/getUserInvites.
 *
 * Usage in a test file:
 *   vi.mock('@/_actions/sharing/getUserInvites', async () => await import('@mocks/@/_actions/sharing/getUserInvites'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(getUserInvites).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

export const getUserInvites = vi.fn(async () => ({
	invites: [] as UserInvite[],
}));

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserInvite {
	id: string;
	plannerId: string;
	plannerName: string;
	invitedBy: string;
	accessLevel: 'read' | 'write' | 'admin' | 'owner';
	invitedAt: string;
	expiresAt: string;
	token: string;
}
