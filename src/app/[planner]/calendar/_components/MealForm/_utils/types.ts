import type { TagInterface } from '@/_models/types';

// What a saved item has to match to be listed: the search, and the selected tags' ids in pick order.
export type SavedItemCriteria = { search: string; tagIds: string[] };

/**
 * One chip in the tag filter. An unselected tag has a `count`, how many current
 * results carry it; a selected one shows no count, so it has none. Named apart
 * from the recipes page's TagOption, a combobox option whose color is a plain string.
 */
export type TagFilterOption =
	| { tag: TagInterface; selected: true }
	| { tag: TagInterface; selected: false; count: number };
