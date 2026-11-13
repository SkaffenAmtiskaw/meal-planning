import {
	type SignInToNewPlannerOptions,
	signInToNewPlanner,
} from './signInToNewPlanner';

import type { BrowserContext, Page } from '../../_fixtures';

// Signs in a member of a new planner made from the options, and opens the planner's Recipes page.
export const openPlannerRecipes = async (
	page: Page,
	context: BrowserContext,
	options: SignInToNewPlannerOptions = {},
) => {
	const planner = await signInToNewPlanner(context, options);
	await page.goto(`/${planner._id}/recipes`);

	return planner;
};
