import { expect, type Page, test } from '../_fixtures';
import { createOwnersInvite } from './_helpers/createOwnersInvite';

const expectInvalidInviteLeadsToSignIn = async (page: Page) => {
	await expect(
		page.getByRole('heading', { name: 'Invalid Invite' }),
	).toBeVisible();
	await page.getByRole('link', { name: 'Go to Sign In' }).click();

	await expect(page).toHaveURL('/');
	await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
};

test('a used invite shows Invalid Invite', async ({ page }) => {
	const {
		invite: { token },
		planner,
	} = await createOwnersInvite();

	await page.goto(`/invite?token=${token}`);
	await page.getByLabel('Create a password').fill('e2e-password');
	await page.getByRole('button', { name: 'Create Account' }).click();
	// Waiting for the redirect means signUpWithInvite has finished and deleted the invite
	await expect(page).toHaveURL(`/?invite_success=true&planner=${planner._id}`);

	await page.goto(`/invite?token=${token}`);

	await expectInvalidInviteLeadsToSignIn(page);
});

test('a bad token shows Invalid Invite', async ({ page }) => {
	await page.goto(`/invite?token=${crypto.randomUUID()}`);

	await expectInvalidInviteLeadsToSignIn(page);
});
