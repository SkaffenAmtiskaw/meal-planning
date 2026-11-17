/**
 * Shared mock for @/_models/calendar.
 *
 * Usage in a test file:
 *   vi.mock('@/_models/calendar', async () => await import('#mocks/@/_models/calendar'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(zMealFormSchema.parse).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const zMealFormSchema = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
	parse: vi.fn(() => ({})),
};

// ─── Types (runtime stubs for destructuring) ──────────────────────────────────

export type MealFormData = Record<string, unknown>;
