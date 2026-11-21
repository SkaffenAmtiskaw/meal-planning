import type { BookmarkInterface, RecipeInterface } from '@/_models/types';

// Which recipes modal is open, and the item an edit opens with.
export type RecipesModal =
	| { status: 'add'; type: 'bookmark' | 'recipe' }
	| { status: 'edit'; type: 'bookmark'; item: BookmarkInterface }
	| { status: 'edit'; type: 'recipe'; item: RecipeInterface };
