import { recipePath } from './recipesLabels';
import {
	type SignInToNewPlannerOptions,
	signInToNewPlanner,
} from './signInToNewPlanner';
import type { recipesSeed } from './recipesSeed';

import type { BrowserContext, Page } from '../../_fixtures';

type SeedRecipe = ReturnType<typeof recipesSeed>['recipe'];

// Signs in a member of a new planner made from the options, and opens the recipe's page. The recipe must be in the options' saved items.
export const openRecipeDetail = async (
	page: Page,
	context: BrowserContext,
	recipe: SeedRecipe,
	options: SignInToNewPlannerOptions = {},
) => {
	const planner = await signInToNewPlanner(context, options);
	await page.goto(recipePath(planner._id, recipe._id));

	return planner;
};
