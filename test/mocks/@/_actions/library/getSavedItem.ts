/**
 * Shared mock for @/_actions/library/getSavedItem.
 *
 * Usage in a test file:
 *   vi.mock('@/_actions/library/getSavedItem', async () => await import('#mocks/@/_actions/library/getSavedItem'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(getSavedItem).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

import type * as GetSavedItem from '@/_actions/library/getSavedItem';

export const getSavedItem = vi.fn<typeof GetSavedItem.getSavedItem>(
	async () => ({
		_id: '507f1f77bcf86cd799439012',
		name: 'Test Item',
		ingredients: [],
		instructions: [],
	}),
);
