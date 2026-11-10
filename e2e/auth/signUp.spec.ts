import { uniqueEmail } from '#factories/uniqueEmail';

import {
	enterEmail,
	expect,
	latestEmailTo,
	linkInEmail,
	test,
} from '../_fixtures';

test('a new email creates an account and shows Check your inbox', async ({
	page,
}) => {
	const email = uniqueEmail();

	await page.goto('/');
	await enterEmail(page, email);
	await page.getByLabel('Create a password').fill('e2e-password');
	await page.getByRole('button', { name: 'Create Account' }).click();

	await expect(page.getByText('Check your inbox')).toContainText(email);
});

test('following the verification link signs the new user in', async ({
	page,
}) => {
	const email = uniqueEmail();
	await page.goto('/');
	await enterEmail(page, email);
	await page.getByLabel('Create a password').fill('e2e-password');
	await page.getByRole('button', { name: 'Create Account' }).click();
	await expect(page.getByText('Check your inbox')).toBeVisible();

	await page.goto(linkInEmail(await latestEmailTo(email)));

	await expect(page).toHaveURL(/\/calendar$/);
	await expect(page.getByRole('grid')).toBeVisible();
});
