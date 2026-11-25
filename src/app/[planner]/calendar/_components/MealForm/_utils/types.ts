import type { TagInterface } from '@/_models/types';

// What a saved item has to match to be listed: the search, and the selected tags' ids in pick order.
export type SavedItemCriteria = { search: string; tagIds: string[] };

/**
 * One chip in the tag filter. `count` is how many current results carry the tag,
 * or null for a selected tag, which shows no count. Named apart from the recipes
 * page's TagOption, a combobox option whose color is a plain string.
 */
export type TagFilterOption = {
	tag: TagInterface;
	selected: boolean;
	count: number | null;
};
