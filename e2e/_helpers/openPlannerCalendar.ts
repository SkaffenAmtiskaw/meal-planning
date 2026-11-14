import { calendarPath } from './plannerPaths';
import {
	type SignInToNewPlannerOptions,
	signInToNewPlanner,
} from './signInToNewPlanner';

import type { BrowserContext, Page } from '../_fixtures';

// Signs in a member of a new planner made from the options, and opens the planner's calendar.
export const openPlannerCalendar = async (
	page: Page,
	context: BrowserContext,
	options: SignInToNewPlannerOptions = {},
) => {
	const { planner } = await signInToNewPlanner(context, options);
	await page.goto(calendarPath(planner._id));

	return planner;
};
