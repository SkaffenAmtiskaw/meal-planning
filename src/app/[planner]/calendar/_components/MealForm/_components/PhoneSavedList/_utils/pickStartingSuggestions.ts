import type { SavedItem } from '@/_actions/library/types';

import { hasBeenUsed } from './hasBeenUsed';

import { orderByRecentUse } from '../../../_utils/orderByRecentUse';

// How many saved recipes the phone list shows before anything narrows it.
const STARTING_ROWS = 5;

/**
 * The saved recipes the phone list opens with: up to 5 of the used ones, most
 * recently used first, never filled out with unused ones. While none has been
 * used, the first 5 by name.
 */
export const pickStartingSuggestions = (
	savedItems: SavedItem[],
): SavedItem[] => {
	const ordered = orderByRecentUse(savedItems);
	const used = ordered.filter(hasBeenUsed);
	return (used.length > 0 ? used : ordered).slice(0, STARTING_ROWS);
};
