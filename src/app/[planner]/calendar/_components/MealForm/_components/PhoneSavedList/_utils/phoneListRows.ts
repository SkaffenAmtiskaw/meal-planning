import type { SavedItem } from '@/_actions/library/types';

import type { SavedItemCriteria } from '../../../_utils/types';

// How many saved recipes the phone list shows before anything narrows it.
const FIRST_ROWS = 5;

/**
 * Which of the narrowed results the phone list shows under a dish's name
 * field: the first few while nothing is typed and no tag is selected, then
 * every one.
 */
export const phoneListRows = (
	results: SavedItem[],
	{ search, tagIds }: SavedItemCriteria,
): SavedItem[] =>
	search.trim() === '' && tagIds.length === 0
		? results.slice(0, FIRST_ROWS)
		: results;
