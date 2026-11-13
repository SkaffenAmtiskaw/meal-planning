import { recipePath } from './recipesPaths';
import type { recipesSeed } from './recipesSeed';

import type { BrowserContext, Page } from '../../_fixtures';
import {
	type SignInToNewPlannerOptions,
	signInToNewPlanner,
} from '../../_helpers/signInToNewPlanner';

type SeedRecipe = ReturnType<typeof recipesSeed>['recipe'];

// Signs in a member of a new planner made from the options, with the recipe added to its saved items, and opens the recipe's page.
export const openRecipeDetail = async (
	page: Page,
	context: BrowserContext,
	recipe: SeedRecipe,
	{ saved = [], ...options }: SignInToNewPlannerOptions = {},
) => {
	const planner = await signInToNewPlanner(context, {
		...options,
		saved: [recipe, ...saved],
	});
	await page.goto(recipePath(planner._id, recipe._id));

	return planner;
};
