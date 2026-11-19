/**
 * Shared mock for @/_actions/sharing/getUserInvites.
 *
 * Usage in a test file:
 *   vi.mock('@/_actions/sharing/getUserInvites', async () => await import('#mocks/@/_actions/sharing/getUserInvites'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(getUserInvites).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

import type * as GetUserInvites from '@/_actions/sharing/getUserInvites';

export const getUserInvites = vi.fn<typeof GetUserInvites.getUserInvites>(
	async () => ({
		invites: [],
	}),
);
