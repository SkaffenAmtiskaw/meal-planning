import {
	type BrowserContext,
	expect,
	type Page,
	signInWithPassword,
	test,
} from '../_fixtures';
import { openSettings } from './_helpers/openSettings';

const OLD_PASSWORD = 'old-password';
const NEW_PASSWORD = 'new-password';

// Changes the password on Settings, then signs out so the sign-in form can be used.
const changePasswordAndSignOut = async (
	page: Page,
	context: BrowserContext,
) => {
	const { planner, user } = await openSettings(page, context, {
		password: OLD_PASSWORD,
	});

	await page.getByLabel('Current password').fill(OLD_PASSWORD);
	// A plain "New password" label would also match "Confirm new password".
	await page.getByLabel('New password', { exact: true }).fill(NEW_PASSWORD);
	await page.getByLabel('Confirm new password').fill(NEW_PASSWORD);
	await page.getByRole('button', { name: 'Update password' }).click();
	await expect(page.getByText('Password updated successfully.')).toBeVisible();

	// Changing the password doesn't sign the user out.
	await context.clearCookies();
	await page.goto('/');

	return { planner, user };
};

test('the new password signs the user in', async ({ context, page }) => {
	const { planner, user } = await changePasswordAndSignOut(page, context);

	await signInWithPassword(page, user.email, NEW_PASSWORD);

	await expect(page).toHaveURL(`/${planner._id}/calendar`);
});

test('the old password is rejected', async ({ context, page }) => {
	const { user } = await changePasswordAndSignOut(page, context);

	await signInWithPassword(page, user.email, OLD_PASSWORD);

	await expect(
		page.getByRole('alert').filter({ hasText: 'Invalid email or password' }),
	).toBeVisible();
});
