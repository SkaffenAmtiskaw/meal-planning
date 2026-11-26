export type SavedItemActionKind = 'add' | 'link' | 'added';

/**
 * What a saved recipe's action does: add it as a dish, link it to the dish
 * being linked, or nothing once it's on the meal. Its button and Enter in the
 * search both follow this, so they can't drift apart.
 */
export const savedItemAction = ({
	added,
	linking,
}: {
	// The recipe is already on the meal.
	added: boolean;
	// A dish is being linked.
	linking: boolean;
}): SavedItemActionKind => {
	if (added) {
		return 'added';
	}
	return linking ? 'link' : 'add';
};
