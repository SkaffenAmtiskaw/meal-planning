/**
 * Shared mock for @/_models/sharing.
 *
 * Usage in a test file:
 *   vi.mock('@/_models/sharing', async () => await import('@mocks/@/_models/sharing'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(PendingInvite.findOne).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

// ─── Mongoose Model ───────────────────────────────────────────────────────────

export const PendingInvite = {
	findOne: vi.fn(),
	create: vi.fn(),
	deleteOne: vi.fn(),
};

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const zPendingInvite = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
	parse: vi.fn(() => ({})),
};

// ─── Types (runtime stubs for destructuring) ──────────────────────────────────

export type PendingInviteInterface = Record<string, unknown>;
