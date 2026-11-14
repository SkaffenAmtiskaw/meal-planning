import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

import { type BrowserContext, type Page, signIn } from '../../_fixtures';

type UserOptions = Omit<Parameters<typeof createUser>[0], 'planners'>;
type PlannerOptions = Parameters<typeof createPlanner>[0];

// Signs in a new user who owns a new planner, and opens Settings.
// Settings sends a user with no planners to `/`, so every Settings user owns one.
export const openSettings = async (
	page: Page,
	context: BrowserContext,
	userOptions: UserOptions = {},
	plannerOptions: PlannerOptions = {},
) => {
	const planner = await createPlanner(plannerOptions);
	const user = await createUser({
		...userOptions,
		planners: [{ planner: planner._id, accessLevel: 'owner' }],
	});
	await signIn(context, user);
	await page.goto('/settings');

	return { planner, user };
};
