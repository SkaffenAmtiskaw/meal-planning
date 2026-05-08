/**
 * Shared mock for @/_models/library.
 *
 * Usage in a test file:
 *   vi.mock('@/_models/library', async () => await import('@mocks/@/_models/library'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(tagSchema).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const bookmarkSchema = {};
export const recipeSchema = {};
export const tagSchema = {};

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const zBookmarkInterface = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
	parse: vi.fn(() => ({})),
};

export const zBookmarkFormSchema = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
	parse: vi.fn(() => ({})),
	omit: vi.fn(() => zBookmarkFormSchema),
	extend: vi.fn(() => zBookmarkFormSchema),
};

export const zRecipeInterface = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
	parse: vi.fn(() => ({})),
};

export const zRecipeFormSchema = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
	parse: vi.fn(() => ({})),
	omit: vi.fn(() => zRecipeFormSchema),
	extend: vi.fn(() => zRecipeFormSchema),
};

export const zTagInterface = {
	safeParse: vi.fn(() => ({ success: true, data: {} })),
	parse: vi.fn(() => ({})),
};

// ─── Types (runtime stubs for destructuring) ──────────────────────────────────

export type BookmarkInterface = Record<string, unknown>;
export type RecipeInterface = Record<string, unknown>;
export type TagInterface = Record<string, unknown>;
export type BookmarkFormData = Record<string, unknown>;
export type RecipeFormData = Record<string, unknown>;
