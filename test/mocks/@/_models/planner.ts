/**
 * Shared mock for @/_models/planner.
 *
 * Usage in a test file:
 *   vi.mock('@/_models/planner', async () => await import('@mocks/@/_models/planner'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(Planner.findById).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

// ─── Mongoose Model ───────────────────────────────────────────────────────────

const mockExec = vi.fn();

export const Planner: any = {
	findById: vi.fn(),
	find: vi.fn(),
	create: vi.fn(),
	deleteOne: vi.fn(() => ({ exec: mockExec })),
	collection: {
		updateOne: vi.fn(),
	},
};

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const zPlannerInterface: any = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
	parse: vi.fn(() => ({})),
};

// ─── Types (runtime stubs for destructuring) ──────────────────────────────────

export type PlannerInterface = Record<string, unknown>;
