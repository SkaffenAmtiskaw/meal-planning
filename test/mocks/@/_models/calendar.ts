/**
 * Shared mock for @/_models/calendar.
 *
 * Usage in a test file:
 *   vi.mock('@/_models/calendar', async () => await import('@mocks/@/_models/calendar'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(daySchema).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

// ─── Schema ───────────────────────────────────────────────────────────────────

export const daySchema = {};

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const zDayInterface = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
	parse: vi.fn(() => ({})),
};

export const zMealFormSchema = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
	parse: vi.fn(() => ({})),
};

export const zDishFormInput = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
	parse: vi.fn(() => ({})),
};

// ─── Types (runtime stubs for destructuring) ──────────────────────────────────

export type DayInterface = Record<string, unknown>;
export type MealFormData = Record<string, unknown>;
export type DishFormInput = Record<string, unknown>;
