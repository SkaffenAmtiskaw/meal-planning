import type { SavedItem } from '@/_actions/library/types';

import { hasBeenUsed } from '../../../_utils/hasBeenUsed';

// How many saved recipes the phone list shows before anything narrows it.
const STARTING_ROWS = 5;

/**
 * The saved recipes the phone list opens with, from items already in the
 * form's order: up to 5 of the used ones, never filled out with unused ones.
 * While none has been used, the first 5 given.
 */
export const pickStartingSuggestions = (
	orderedItems: SavedItem[],
): SavedItem[] => {
	const used = orderedItems.filter(hasBeenUsed);
	return (used.length > 0 ? used : orderedItems).slice(0, STARTING_ROWS);
};
