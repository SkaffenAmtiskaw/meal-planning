import { createPlanner } from '#factories/planner';
import { type AccessLevel, createUser } from '#factories/user';

import { type BrowserContext, signIn } from '../_fixtures';

export type SignInToNewPlannerOptions = Parameters<typeof createPlanner>[0] & {
	accessLevel?: AccessLevel;
	user?: Omit<Parameters<typeof createUser>[0], 'planners'>;
};

// Creates a planner from the overrides, and signs in a new member of it, made from the user options, with the access level.
export const signInToNewPlanner = async (
	context: BrowserContext,
	{
		accessLevel = 'write',
		user: userOptions = {},
		...overrides
	}: SignInToNewPlannerOptions = {},
) => {
	const planner = await createPlanner(overrides);
	const user = await createUser({
		...userOptions,
		planners: [{ planner: planner._id, accessLevel }],
	});
	await signIn(context, user);

	return { planner, user };
};
