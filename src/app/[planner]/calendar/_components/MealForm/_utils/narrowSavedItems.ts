import type { SavedItem } from '@/_actions/library/types';

import { filterSavedItems } from './filterSavedItems';
import { orderSavedItems } from './orderSavedItems';
import { rankTagOptions } from './rankTagOptions';
import type { SavedItemCriteria, TagFilterOption } from './types';

/**
 * The planner's saved recipes narrowed by the search and the selected tags, in
 * order, and the tag filter's chips counted over those results. Both the
 * desktop Saved recipes column and the phone saved list narrow through here.
 */
export const narrowSavedItems = (
	savedItems: SavedItem[],
	criteria: SavedItemCriteria,
): { results: SavedItem[]; tagOptions: TagFilterOption[] } => {
	const results = filterSavedItems(orderSavedItems(savedItems), criteria);
	const tagOptions = rankTagOptions({
		countOver: results,
		savedItems,
		selectedIds: criteria.tagIds,
	});
	return { results, tagOptions };
};
