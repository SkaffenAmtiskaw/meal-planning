/**
 * Shared mock for @/_actions/library.
 *
 * Usage in a test file:
 *   vi.mock('@/_actions/library', async () => await import('@mocks/@/_actions/library'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(addRecipe).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

export const addBookmark = vi.fn(async () => ({
	ok: true as const,
	data: { _id: '507f1f77bcf86cd799439012', name: 'New Bookmark' },
}));

export const addRecipe = vi.fn(async () => ({
	ok: true as const,
	data: { _id: '507f1f77bcf86cd799439012', name: 'New Recipe' },
}));

export const addTag = vi.fn(async () => ({
	ok: true as const,
	data: { _id: '507f1f77bcf86cd799439012', name: 'New Tag', color: 'blue' },
}));

export const deleteBookmark = vi.fn(async () => ({
	ok: true as const,
	data: undefined,
}));

export const deleteRecipe = vi.fn(async () => ({
	ok: true as const,
	data: undefined,
}));

export const editBookmark = vi.fn(async () => ({
	ok: true as const,
	data: { _id: '507f1f77bcf86cd799439012', name: 'Updated Bookmark' },
}));

export const editRecipe = vi.fn(async () => ({
	ok: true as const,
	data: { _id: '507f1f77bcf86cd799439012', name: 'Updated Recipe' },
}));

export const getSavedItem = vi.fn(async () => ({
	_id: { toString: () => '507f1f77bcf86cd799439012' },
	name: 'Test Item',
}));

export const updateRecipeNotes = vi.fn(async () => ({
	ok: true as const,
	data: undefined,
}));

export const updateRecipeTags = vi.fn(async () => ({
	ok: true as const,
	data: undefined,
}));
