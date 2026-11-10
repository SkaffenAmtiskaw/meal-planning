import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

import { expect, latestEmailTo, linkInEmail, test } from '../_fixtures';

test('a failed verification shows Verification link expired', async ({
	page,
}) => {
	await page.goto('/verify-email?error=invalid_token');

	await expect(
		page.getByRole('heading', { name: 'Verification link expired' }),
	).toBeVisible();
});

test('the form sends a new link that verifies the user', async ({ page }) => {
	const planner = await createPlanner();
	const user = await createUser({
		planners: [{ planner: planner._id, accessLevel: 'owner' }],
		password: 'e2e-password',
		emailVerified: false,
	});

	await page.goto('/verify-email?error=invalid_token');
	await expect(
		page.getByRole('heading', { name: 'Verification link expired' }),
	).toBeVisible();
	await page.getByRole('textbox', { name: 'Email' }).fill(user.email);
	await page.getByRole('button', { name: 'Resend verification email' }).click();
	await expect(page.getByText('Verification email sent')).toBeVisible();

	await page.goto(linkInEmail(await latestEmailTo(user.email)));

	await expect(page).toHaveURL(`/${planner._id}/calendar`);
	await expect(page.getByRole('grid')).toBeVisible();
});

test('with no error the page redirects to /', async ({ page }) => {
	await page.goto('/verify-email');

	await expect(page).toHaveURL('/');
	await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
});
