import { createUser } from '#factories/user';

import {
	expect,
	latestEmailTo,
	linkInEmail,
	type Page,
	test,
} from '../_fixtures';

const submitNewPassword = async (page: Page) => {
	await page.getByLabel('New password', { exact: true }).fill('new-password');
	await page
		.getByLabel('Confirm new password', { exact: true })
		.fill('new-password');
	await page.getByRole('button', { name: 'Reset password' }).click();
};

const requestResetLink = async (page: Page, email: string) => {
	await page.goto('/');
	await page.getByRole('textbox', { name: 'Email' }).fill(email);
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByRole('button', { name: 'Forgot password?' }).click();
	await expect(page.getByText('Check your inbox')).toContainText(email);
	return linkInEmail(await latestEmailTo(email));
};

test('no token shows Invalid reset link', async ({ page }) => {
	await page.goto('/reset-password');

	await expect(
		page.getByRole('heading', { name: 'Invalid reset link' }),
	).toBeVisible();
});

test('a made-up token shows an error', async ({ page }) => {
	await page.goto('/reset-password?token=made-up-token');
	await submitNewPassword(page);

	await expect(page.getByTestId('error-alert')).toBeVisible();
});

test('an already-used link shows Invalid reset link', async ({ page }) => {
	const user = await createUser({
		planners: [],
		password: 'old-password',
	});
	const link = await requestResetLink(page, user.email);

	await page.goto(link);
	await submitNewPassword(page);
	await expect(page).toHaveURL('/');
	await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();

	await page.goto(link);

	await expect(
		page.getByRole('heading', { name: 'Invalid reset link' }),
	).toBeVisible();
});
