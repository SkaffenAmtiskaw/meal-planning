import { newObjectId } from '#factories/objectId';
import type { createPlanner } from '#factories/planner';
import { TAG_COLOR_NAMES } from '@/_theme/colors';

type PlannerOverrides = NonNullable<Parameters<typeof createPlanner>[0]>;
type SavedItem = NonNullable<PlannerOverrides['saved']>[number];
type SeedTag = NonNullable<PlannerOverrides['tags']>[number];

// Two tags, a recipe with every field set and a bookmark, with new IDs on every call, for the open helpers' saved and tags overrides.
export const recipesSeed = () => {
	// Coloured in the order addTag assigns colours.
	const tags = [
		{ _id: newObjectId(), name: 'Enchanted Supper', color: TAG_COLOR_NAMES[0] },
		{ _id: newObjectId(), name: 'Royal Feast', color: TAG_COLOR_NAMES[1] },
	] satisfies SeedTag[];

	// No url, which is how the app tells a recipe from a bookmark.
	const recipe = {
		_id: newObjectId(),
		name: "Tiana's Beignets",
		source: { name: 'Bayou Kitchen', url: 'https://example.com/beignets' },
		time: {
			prep: '20 minutes',
			cook: '15 minutes',
			total: '35 minutes',
			actual: '50 minutes',
		},
		servings: 12,
		ingredients: ['2 cups flour', '1 cup buttermilk'],
		instructions: ['Mix the dough until smooth', 'Fry until golden brown'],
		notes: 'Dust with powdered sugar while warm',
		storage: 'Keeps in a tin for two days',
		tags: [tags[0]._id],
	} satisfies SavedItem;

	const bookmark = {
		_id: newObjectId(),
		name: "Ratatouille from Gusteau's",
		url: 'https://example.com/ratatouille',
		tags: [tags[1]._id],
	} satisfies SavedItem;

	return { tags, recipe, bookmark };
};
