import { expect, test } from '../_fixtures';
import { openSettings } from './_helpers/openSettings';

test('a planner made from New Planner shows in the list', async ({
	context,
	page,
}) => {
	await openSettings(page, context, {}, { name: 'Weeknight Dinners' });

	await page.getByRole('tab', { name: 'Planner Settings' }).click();
	// Desktop and phone each show one of two buttons named "New Planner".
	await page.getByRole('button', { name: 'New Planner' }).click();

	// The existing planner's rename field is also labelled "Planner name".
	const dialog = page.getByRole('dialog');
	await dialog.getByLabel('Planner name').fill('Weekend Brunch');
	await dialog.getByRole('button', { name: 'Create' }).click();

	await expect(
		page.getByRole('button', { name: 'Weeknight Dinners' }),
	).toBeVisible();
	await expect(
		page.getByRole('button', { name: 'Weekend Brunch' }),
	).toBeVisible();
});
