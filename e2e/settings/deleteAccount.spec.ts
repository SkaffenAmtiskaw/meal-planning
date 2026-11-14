import { enterEmail, expect, latestEmailTo, test } from '../_fixtures';
import { openSettings } from './_helpers/openSettings';

test('a confirmed delete signs the user out, removes the account and sends the deletion email', async ({
	context,
	page,
}) => {
	// A password means a surviving account would show the password step, not the new-account step.
	const { user } = await openSettings(page, context, {
		password: 'e2e-password',
	});

	await page.getByLabel('Type DELETE to confirm').fill('DELETE');
	await page.getByRole('button', { name: 'Delete account' }).click();

	await expect(page).toHaveURL('/');
	await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();

	// The sign-in page treats a deleted account's email as new.
	await enterEmail(page, user.email);
	await expect(page.getByLabel('Create a password')).toBeVisible();

	// The deletion email has no link to follow.
	const email = await latestEmailTo(user.email);
	expect(email.subject).toBe('Your Meal Planner account has been deleted');
});
