/**
 * Shared mock for @/_models/library.
 *
 * Usage in a test file:
 *   vi.mock('@/_models/library', async () => await import('#mocks/@/_models/library'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(zRecipeFormSchema.parse).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const zRecipeFormSchema = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
	parse: vi.fn(() => ({})),
	omit: vi.fn(() => zRecipeFormSchema),
	extend: vi.fn(() => zRecipeFormSchema),
};

export const zBookmarkFormSchema = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
	parse: vi.fn(() => ({})),
	extend: vi.fn(() => zBookmarkFormSchema),
};
