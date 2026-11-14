import { expect, test } from '../_fixtures';
import { signInToNewPlanner } from '../_helpers/signInToNewPlanner';
import { trySignInWithPassword } from './_helpers/trySignInWithPassword';

const OLD_PASSWORD = 'old-password';
const NEW_PASSWORD = 'new-password';

test('after a change, the new password signs in and the old one does not', async ({
	context,
	page,
}) => {
	const { user } = await signInToNewPlanner(context, {
		accessLevel: 'owner',
		user: { password: OLD_PASSWORD },
	});
	await page.goto('/settings');

	await page.getByLabel('Current password').fill(OLD_PASSWORD);
	// A plain "New password" label would also match "Confirm new password".
	await page.getByLabel('New password', { exact: true }).fill(NEW_PASSWORD);
	await page.getByLabel('Confirm new password').fill(NEW_PASSWORD);
	await page.getByRole('button', { name: 'Update password' }).click();
	await expect(page.getByText('Password updated successfully.')).toBeVisible();

	expect(await trySignInWithPassword(page, user.email, NEW_PASSWORD)).toBe(
		true,
	);
	expect(await trySignInWithPassword(page, user.email, OLD_PASSWORD)).toBe(
		false,
	);
});
