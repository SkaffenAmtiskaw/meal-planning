/**
 * Shared mock for @/_models/library.
 *
 * Usage in a test file:
 *   vi.mock('@/_models/library', async () => await import('#mocks/@/_models/library'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(zRecipeFormSchema.safeParse).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const zRecipeFormSchema = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
	extend: vi.fn(() => zRecipeFormSchema),
};

export const zBookmarkFormSchema = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
	extend: vi.fn(() => zBookmarkFormSchema),
};
