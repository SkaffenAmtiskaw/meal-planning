import { createPlanner } from '../../test/factories/planner';
import { createUser } from '../../test/factories/user';
import { expect, signIn, test } from '../_fixtures';

test('signed-in user lands on their planner calendar', async ({
	context,
	page,
}) => {
	const planner = await createPlanner();
	const user = await createUser({
		planners: [{ planner: planner._id, accessLevel: 'owner' }],
	});
	await signIn(context, user);

	await page.goto('/');

	await expect(page).toHaveURL(`/${planner._id}/calendar`);
	await expect(page.getByRole('grid')).toBeVisible();
});
