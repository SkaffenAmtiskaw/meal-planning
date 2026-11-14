import { expect, test } from '../_fixtures';
import { openSettings } from './_helpers/openSettings';

test('a renamed planner shows its new name', async ({ context, page }) => {
	await openSettings(page, context, {}, { name: 'Weeknight Dinners' });

	await page.getByRole('tab', { name: 'Planner Settings' }).click();
	await page.getByRole('button', { name: 'Weeknight Dinners' }).click();

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
