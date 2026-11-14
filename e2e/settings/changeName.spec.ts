import { expect, test } from '../_fixtures';
import { signInToNewPlanner } from '../_helpers/signInToNewPlanner';

test('saves a changed name and shows it on Settings', async ({
	context,
	page,
}) => {
	const newName = 'Grace Hopper';
	await signInToNewPlanner(context, {
		accessLevel: 'owner',
		user: { name: 'Ada Lovelace' },
	});
	await page.goto('/settings');

	await page.getByRole('button', { name: 'Change name' }).click();
	await page.getByLabel('New name').fill(newName);
	await page.getByRole('button', { name: 'Save name' }).click();

	const userSettings = page.getByRole('tabpanel', { name: 'User Settings' });
	await expect(userSettings.getByText(newName, { exact: true })).toBeVisible();
	await expect(userSettings.getByText('Ada Lovelace')).toHaveCount(0);
});
