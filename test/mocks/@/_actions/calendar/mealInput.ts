/**
 * Shared mock for @/_actions/calendar/mealInput.
 *
 * Usage in a test file:
 *   vi.mock('@/_actions/calendar/mealInput', async () => await import('#mocks/@/_actions/calendar/mealInput'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(zAddMealInput.safeParse).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const zAddMealInput = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
};
