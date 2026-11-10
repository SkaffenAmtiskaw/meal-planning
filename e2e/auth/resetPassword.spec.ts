import { createUser } from '#factories/user';

import {
	expect,
	latestEmailTo,
	linkInEmail,
	requestPasswordReset,
	submitNewPassword,
	test,
} from '../_fixtures';

test('no token shows Invalid reset link', async ({ page }) => {
	await page.goto('/reset-password');

	await expect(
		page.getByRole('heading', { name: 'Invalid reset link' }),
	).toBeVisible();
});

test('a made-up token shows an error', async ({ page }) => {
	await page.goto('/reset-password?token=made-up-token');
	await submitNewPassword(page, 'new-password');

	await expect(
		page.getByRole('alert').filter({ hasText: 'Invalid token' }),
	).toBeVisible();
});

test('an already-used link shows Invalid reset link', async ({ page }) => {
	const user = await createUser({
		planners: [],
		password: 'old-password',
	});
	await requestPasswordReset(page, user.email);
	const link = linkInEmail(await latestEmailTo(user.email));

	await page.goto(link);
	await submitNewPassword(page, 'new-password');
	await expect(page).toHaveURL('/');
	await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();

	await page.goto(link);

	await expect(
		page.getByRole('heading', { name: 'Invalid reset link' }),
	).toBeVisible();
});
