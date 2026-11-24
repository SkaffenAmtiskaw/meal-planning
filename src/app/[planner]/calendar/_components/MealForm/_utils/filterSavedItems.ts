import type { SavedItem } from '@/_actions/library/types';

// What a saved recipe has to match to be listed. The tag filter adds the selected tags.
type SavedItemCriteria = { search: string };

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
