import type { SavedItem } from '@/_actions/library/types';

import type { SavedItemCriteria } from './types';

/**
 * The saved items, recipes and bookmarks both, that match the criteria: those
 * whose name holds the search anywhere, ignoring case, and that carry every
 * selected tag. A search of only spaces matches everything.
 */
export const filterSavedItems = (
	savedItems: SavedItem[],
	{ search, tagIds }: SavedItemCriteria,
): SavedItem[] => {
	const needle = search.trim().toLowerCase();
	return savedItems.filter(
		(item) =>
			item.name.toLowerCase().includes(needle) &&
			tagIds.every((id) => item.tags.some((tag) => tag._id === id)),
	);
};
