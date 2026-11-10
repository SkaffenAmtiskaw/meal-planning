import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

import {
	expect,
	latestEmailTo,
	linkInEmail,
	type Page,
	test,
} from '../_fixtures';

const createUserWithPlanner = async () => {
	const planner = await createPlanner();
	const user = await createUser({
		planners: [{ planner: planner._id, accessLevel: 'owner' }],
		password: 'old-password',
	});
	return { planner, user };
};

const requestReset = async (page: Page, email: string) => {
	await page.goto('/');
	await page.getByRole('textbox', { name: 'Email' }).fill(email);
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByRole('button', { name: 'Forgot password?' }).click();
	await expect(page.getByText('Check your inbox')).toContainText(email);
};

const resetPassword = async (page: Page, email: string) => {
	await requestReset(page, email);
	await page.goto(linkInEmail(await latestEmailTo(email)));
	await page.getByLabel('New password', { exact: true }).fill('new-password');
	await page
		.getByLabel('Confirm new password', { exact: true })
		.fill('new-password');
	await page.getByRole('button', { name: 'Reset password' }).click();
	await expect(page).toHaveURL('/');
};

const signInWithForm = async (page: Page, email: string, password: string) => {
	await page.getByRole('textbox', { name: 'Email' }).fill(email);
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByLabel('Password', { exact: true }).fill(password);
	await page.getByRole('button', { name: 'Sign In' }).click();
};

test('Forgot password? shows Check your inbox and sends the reset email', async ({
	page,
}) => {
	const { user } = await createUserWithPlanner();

	await requestReset(page, user.email);

	const email = await latestEmailTo(user.email);
	expect(email.subject).toBe('Reset your Meal Planner password');
});

test('the new password signs the user in', async ({ page }) => {
	const { planner, user } = await createUserWithPlanner();

	await resetPassword(page, user.email);
	await signInWithForm(page, user.email, 'new-password');

	await expect(page).toHaveURL(`/${planner._id}/calendar`);
	await expect(page.getByRole('grid')).toBeVisible();
});

test('the old password no longer works', async ({ page }) => {
	const { user } = await createUserWithPlanner();

	await resetPassword(page, user.email);
	await signInWithForm(page, user.email, 'old-password');

	await expect(page.getByTestId('signin-error-alert')).toBeVisible();
});
