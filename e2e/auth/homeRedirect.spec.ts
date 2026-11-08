import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

import { expect, signIn, test } from '../_fixtures';

test('signed-in user lands on the planner recipes page', async ({
	context,
	page,
}) => {
	const planner = await createPlanner();
	const user = await createUser({
		planners: [{ planner: planner._id, accessLevel: 'owner' }],
	});
	await signIn(context, user);

	await page.goto('/');

	await expect(page).toHaveURL(`/${planner._id}/recipes`);
});
