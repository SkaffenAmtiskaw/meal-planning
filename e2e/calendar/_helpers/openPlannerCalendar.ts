import type { BrowserContext, Page } from '../../_fixtures';
import {
	type SignInToNewPlannerOptions,
	signInToNewPlanner,
} from '../../_helpers/signInToNewPlanner';

// Signs in a member of a new planner made from the options, and opens the planner's calendar.
export const openPlannerCalendar = async (
	page: Page,
	context: BrowserContext,
	options: SignInToNewPlannerOptions = {},
) => {
	const { planner } = await signInToNewPlanner(context, options);
	await page.goto(`/${planner._id}/calendar`);

	return planner;
};
