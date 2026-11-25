import type { SavedItem } from '@/_actions/library/types';

type SavedRecipe = Extract<SavedItem, { kind: 'recipe' }>;

// A saved recipe with no tags, whose id is its name unless one is given.
export const makeSavedItem = ({
	name = '',
	...overrides
}: Partial<SavedRecipe> = {}): SavedRecipe => ({
	_id: name,
	name,
	kind: 'recipe',
	tags: [],
	...overrides,
});
