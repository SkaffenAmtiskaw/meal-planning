import type { SavedItem } from '@/_actions/library/types';

import { pickStartingSuggestions } from './pickStartingSuggestions';

import type { SavedItemCriteria } from '../../../_utils/types';

/**
 * Which of the narrowed results the phone list shows under a dish's name
 * field: the starting suggestions while nothing is typed and no tag is
 * selected, then every one.
 */
export const phoneListRows = (
	results: SavedItem[],
	{ search, tagIds }: SavedItemCriteria,
): SavedItem[] =>
	search.trim() === '' && tagIds.length === 0
		? pickStartingSuggestions(results)
		: results;
