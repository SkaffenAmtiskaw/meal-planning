import { createEmailChangeRequest } from '#factories/emailChange';
import { createUser } from '#factories/user';

import { expect, test } from '../_fixtures';

test('a valid link shows the new email', async ({ page }) => {
	const user = await createUser({ planners: [], password: 'e2e-password' });
	const { token, email } = await createEmailChangeRequest(user);

	await page.goto(`/verify-email-change?token=${token}`);

	await expect(
		page.getByRole('heading', { name: 'Email updated' }),
	).toBeVisible();
	await expect(
		page.getByText(`Your email has been changed to ${email}.`),
	).toBeVisible();
});

test('no token shows Invalid link', async ({ page }) => {
	await page.goto('/verify-email-change');

	await expect(
		page.getByRole('heading', { name: 'Invalid link' }),
	).toBeVisible();
});

test('an unknown token shows Link expired', async ({ page }) => {
	await page.goto(`/verify-email-change?token=${crypto.randomUUID()}`);

	await expect(
		page.getByRole('heading', { name: 'Link expired' }),
	).toBeVisible();
});

test('an expired token shows Link expired', async ({ page }) => {
	const user = await createUser({ planners: [], password: 'e2e-password' });
	const { token } = await createEmailChangeRequest(user, {
		expiresAt: new Date(Date.now() - 60 * 1000),
	});

	await page.goto(`/verify-email-change?token=${token}`);

	await expect(
		page.getByRole('heading', { name: 'Link expired' }),
	).toBeVisible();
});

test('a user with no password sees Set a password to continue', async ({
	page,
}) => {
	const user = await createUser({ planners: [] });
	const { token } = await createEmailChangeRequest(user);

	await page.goto(`/verify-email-change?token=${token}`);

	await expect(
		page.getByRole('heading', { name: 'Set a password to continue' }),
	).toBeVisible();
});
