import { recipesListPath } from './recipesPaths';

import type { BrowserContext, Page } from '../../_fixtures';
import {
	type SignInToNewPlannerOptions,
	signInToNewPlanner,
} from '../../_helpers/signInToNewPlanner';

// Signs in a member of a new planner made from the options, and opens the planner's Recipes page.
export const openPlannerRecipes = async (
	page: Page,
	context: BrowserContext,
	options: SignInToNewPlannerOptions = {},
) => {
	const { planner } = await signInToNewPlanner(context, options);
	await page.goto(recipesListPath(planner._id));

	return planner;
};
