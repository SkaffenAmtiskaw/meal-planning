import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

import { type BrowserContext, type Page, signIn } from '../../_fixtures';

type AccessLevel = Parameters<
	typeof createUser
>[0]['planners'][number]['accessLevel'];

type OpenPlannerCalendarOptions = Parameters<typeof createPlanner>[0] & {
	accessLevel?: AccessLevel;
};

// Creates a planner from the overrides, signs in a member with the access level, and opens the planner's calendar.
export const openPlannerCalendar = async (
	page: Page,
	context: BrowserContext,
	{ accessLevel = 'write', ...overrides }: OpenPlannerCalendarOptions = {},
) => {
	const planner = await createPlanner(overrides);
	const user = await createUser({
		planners: [{ planner: planner._id, accessLevel }],
	});
	await signIn(context, user);
	await page.goto(`/${planner._id}/calendar`);

	return planner;
};
