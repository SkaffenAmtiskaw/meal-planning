import type { SavedItem } from '@/_actions/library/types';

import type { SavedItemCriteria } from './types';

/**
 * The saved recipes that match the criteria: those whose name holds the search
 * anywhere, ignoring case. A search of only spaces matches everything.
 */
export const filterSavedItems = (
	savedItems: SavedItem[],
	{ search }: SavedItemCriteria,
): SavedItem[] => {
	const needle = search.trim().toLowerCase();
	return savedItems.filter((item) => item.name.toLowerCase().includes(needle));
};
