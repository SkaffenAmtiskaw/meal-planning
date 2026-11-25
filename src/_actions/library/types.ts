import type { TagInterface } from '@/_models/types';

type SavedItemSummary = {
	_id: string;
	name: string;
	tags: TagInterface[];
};

/**
 * A planner's saved recipe or bookmark, as `getSavedItems` returns it: only
 * what lists of saved items show, with its tags resolved. `kind` tells the two
 * apart, and only a bookmark has a url.
 */
export type SavedItem =
	| (SavedItemSummary & { kind: 'recipe' })
	| (SavedItemSummary & { kind: 'bookmark'; url: string });
