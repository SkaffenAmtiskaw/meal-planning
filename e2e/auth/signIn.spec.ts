import { linkGoogleAccount } from '#factories/account';
import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

import {
	emailsTo,
	enterEmail,
	expect,
	signInWithPassword,
	test,
} from '../_fixtures';

test('the right password lands the user on their planner', async ({ page }) => {
	const planner = await createPlanner();
	const user = await createUser({
		planners: [{ planner: planner._id, accessLevel: 'owner' }],
		password: 'e2e-password',
	});

	await page.goto('/');
	await signInWithPassword(page, user.email, 'e2e-password');

	await expect(page).toHaveURL(`/${planner._id}/calendar`);
	await expect(page.getByRole('grid')).toBeVisible();
});

test('a wrong password shows an error and keeps the user signed out', async ({
	page,
}) => {
	const user = await createUser({ planners: [], password: 'e2e-password' });

	await page.goto('/');
	await signInWithPassword(page, user.email, 'wrong-password');

	await expect(
		page.getByRole('alert').filter({ hasText: 'Invalid email or password' }),
	).toBeVisible();
	await page.reload();
	await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
});

test("an unverified user can't sign in", async ({ page }) => {
	const user = await createUser({
		planners: [],
		password: 'e2e-password',
		emailVerified: false,
	});

	await page.goto('/');
	await signInWithPassword(page, user.email, 'e2e-password');

	await expect(
		page.getByRole('alert').filter({ hasText: 'Email not verified' }),
	).toBeVisible();
	await page.reload();
	await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
	expect(await emailsTo(user.email)).toEqual([]);
});

test('a Google-only email shows the Google alert', async ({ page }) => {
	const user = await createUser({ planners: [] });
	await linkGoogleAccount(user);

	await page.goto('/');
	await enterEmail(page, user.email);

	await expect(
		page.getByText('This email is linked to a Google account'),
	).toBeVisible();
});
