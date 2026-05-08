/**
 * Shared mock for @/_models/user.
 *
 * Usage in a test file:
 *   vi.mock('@/_models/user', async () => await import('@mocks/@/_models/user'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(User.findOne).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

// ─── Mongoose Model ───────────────────────────────────────────────────────────

const mockExec = vi.fn();

export const User: any = {
	findOne: vi.fn(() => ({ exec: mockExec })),
	findById: vi.fn(),
	findByIdAndUpdate: vi.fn(),
	create: vi.fn(),
	updateOne: vi.fn(),
	deleteOne: vi.fn(() => ({ exec: mockExec })),
	countDocuments: vi.fn(() => ({ exec: mockExec })),
	collection: {
		updateOne: vi.fn(),
	},
};

// ─── Schema ───────────────────────────────────────────────────────────────────

export const userSchema = {};

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const zUserInterface: any = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
	parse: vi.fn(() => ({})),
};

export const zPlannerMembership: any = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
	parse: vi.fn(() => ({})),
};

export const zAccessLevel: any = {
	safeParse: vi.fn(() => ({ success: true, data: 'owner' })),
	parse: vi.fn(() => 'owner'),
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const ACCESS_LEVELS = ['owner', 'admin', 'write', 'read'] as const;

// ─── Types (runtime stubs for destructuring) ──────────────────────────────────

export type AccessLevel = (typeof ACCESS_LEVELS)[number];
export type UserInterface = Record<string, unknown>;
export type PlannerMembership = Record<string, unknown>;
