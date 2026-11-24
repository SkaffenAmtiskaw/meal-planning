import type { SavedItem } from '@/_actions/library/types';

import { filterSavedItems } from './filterSavedItems';
import { orderSavedItems } from './orderSavedItems';
import type { SavedItemCriteria } from './types';

// How many saved recipes the phone list shows before anything is typed.
const FIRST_ROWS = 5;

/**
 * The saved recipes the phone list shows under a dish's name field: the first
 * few in order before anything is typed, then every match.
 */
export const phoneListRows = (
	savedItems: SavedItem[],
	criteria: SavedItemCriteria,
): SavedItem[] => {
	const ordered = orderSavedItems(savedItems);
	return criteria.search.trim() === ''
		? ordered.slice(0, FIRST_ROWS)
		: filterSavedItems(ordered, criteria);
};
