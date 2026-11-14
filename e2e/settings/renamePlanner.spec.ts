import { expect, test } from '../_fixtures';
import { signInToNewPlanner } from '../_helpers/signInToNewPlanner';
import { openPlannerSettings } from './_helpers/openPlannerSettings';

test('a renamed planner shows its new name', async ({ context, page }) => {
	await signInToNewPlanner(context, {
		accessLevel: 'owner',
		name: 'Weeknight Dinners',
	});
	await page.goto('/settings');
	await openPlannerSettings(page, 'Weeknight Dinners');

	await page.getByRole('button', { name: 'Rename', exact: true }).click();
	await page.getByLabel('Planner name').fill('Family Meals');
	await page.getByRole('button', { name: 'Save', exact: true }).click();

	await expect(
		page.getByRole('button', { name: 'Family Meals' }),
	).toBeVisible();
	await expect(
		page.getByRole('button', { name: 'Weeknight Dinners' }),
	).toHaveCount(0);
});
