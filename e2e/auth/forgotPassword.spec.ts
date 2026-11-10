import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

import {
	expect,
	latestEmailTo,
	linkInEmail,
	type Page,
	requestPasswordReset,
	signInWithPassword,
	submitNewPassword,
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

const resetPasswordFromEmail = async (page: Page, email: string) => {
	await requestPasswordReset(page, email);
	await page.goto(linkInEmail(await latestEmailTo(email)));
	await submitNewPassword(page, 'new-password');
	await expect(page).toHaveURL('/');
};

test('Forgot password? shows Check your inbox and sends the reset email', async ({
	page,
}) => {
	const { user } = await createUserWithPlanner();

	await requestPasswordReset(page, user.email);

	const email = await latestEmailTo(user.email);
	expect(email.subject).toBe('Reset your Meal Planner password');
});

test('the new password signs the user in', async ({ page }) => {
	const { planner, user } = await createUserWithPlanner();

	await resetPasswordFromEmail(page, user.email);
	await signInWithPassword(page, user.email, 'new-password');

	await expect(page).toHaveURL(`/${planner._id}/calendar`);
	await expect(page.getByRole('grid')).toBeVisible();
});

test('the old password no longer works', async ({ page }) => {
	const { user } = await createUserWithPlanner();

	await resetPasswordFromEmail(page, user.email);
	await signInWithPassword(page, user.email, 'old-password');

	await expect(
		page.getByRole('alert').filter({ hasText: 'Invalid email or password' }),
	).toBeVisible();
});
