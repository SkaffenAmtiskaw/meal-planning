import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

import { expect, signIn, test } from '../_fixtures';
import { openPlannerSettings } from '../_helpers/openPlannerSettings';

test('leaving your last planner and creating a new one brings you back to the app', async ({
	context,
	page,
}) => {
	const planner = await createPlanner({ name: 'Family Meals' });
	await createUser({
		planners: [{ planner: planner._id, accessLevel: 'owner' }],
	});
	const member = await createUser({
		planners: [{ planner: planner._id, accessLevel: 'write' }],
	});
	await signIn(context, member);
	await page.goto('/settings');
	await openPlannerSettings(page, 'Family Meals');

	await page.getByRole('button', { name: 'Leave Planner' }).click();
	await page
		.getByRole('dialog')
		.getByRole('button', { name: 'Leave Planner' })
		.click();

	await expect(page).toHaveURL('/');
	await expect(
		page.getByText("You don't have any planners yet."),
	).toBeVisible();

	await page.getByRole('button', { name: 'Create Planner' }).click();
	const dialog = page.getByRole('dialog');
	await dialog.getByLabel('Planner name').fill('Weekend Brunch');
	await dialog.getByRole('button', { name: 'Create' }).click();

	await expect(page).toHaveURL(/\/[0-9a-f]{24}\/calendar$/);
	await expect(page).not.toHaveURL(`/${planner._id}/calendar`);
	await expect(page.getByRole('grid')).toBeVisible();
});
