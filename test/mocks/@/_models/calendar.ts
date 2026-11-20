/**
 * Shared mock for @/_models/calendar.
 *
 * Usage in a test file:
 *   vi.mock('@/_models/calendar', async () => await import('#mocks/@/_models/calendar'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(zMealFormSchema.safeParse).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const zMealFormSchema = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
};
