import { expect, signIn, test } from '../_fixtures';
import { openPlannerSettings } from '../_helpers/openPlannerSettings';
import { createSharedPlanner } from './_helpers/createSharedPlanner';

test('a member who leaves a planner no longer has it in their list', async ({
	context,
	page,
}) => {
	const { member } = await createSharedPlanner();
	await signIn(context, member);
	await page.goto('/settings');
	await openPlannerSettings(page, 'Family Meals');

	await page.getByRole('button', { name: 'Leave Planner' }).click();
	await page
		.getByRole('dialog')
		.getByRole('button', { name: 'Leave Planner' })
		.click();

	await expect(page.getByRole('button', { name: 'Family Meals' })).toHaveCount(
		0,
	);
	await expect(
		page.getByRole('button', { name: 'Solo Lunches' }),
	).toBeVisible();
});
