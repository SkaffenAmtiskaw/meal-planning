import { uniqueEmail } from '#factories/uniqueEmail';

import { expect, latestEmailTo, linkInEmail, signIn, test } from '../_fixtures';
import { openSettings } from './_helpers/openSettings';

test('following the email change link changes the email on Settings', async ({
	context,
	page,
}) => {
	const newEmail = uniqueEmail();
	// The link page asks a user with no password to set one first.
	const { user } = await openSettings(page, context, {
		password: 'e2e-password',
	});

	await page.getByRole('button', { name: 'Change email' }).click();
	await page.getByLabel('New email address').fill(newEmail);
	await page.getByRole('button', { name: 'Send verification email' }).click();

	await page.goto(linkInEmail(await latestEmailTo(newEmail)));
	await expect(
		page.getByRole('heading', { name: 'Email updated' }),
	).toBeVisible();

	// The old session's cookie cache still holds the old email.
	await context.clearCookies();
	await signIn(context, user);
	await page.goto('/settings');

	const userSettings = page.getByRole('tabpanel', { name: 'User Settings' });
	await expect(userSettings.getByText(newEmail, { exact: true })).toBeVisible();
	await expect(userSettings.getByText(user.email, { exact: true })).toHaveCount(
		0,
	);
});
