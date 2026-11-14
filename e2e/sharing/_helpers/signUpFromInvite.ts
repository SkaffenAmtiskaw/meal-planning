import { expect, type Page } from '../../_fixtures';

// Fills in and submits the sign-up form on /invite, and waits for the sign-in page signUpWithInvite redirects to,
// so the account exists and the invite is used up when it returns.
export const signUpFromInvite = async (
	page: Page,
	plannerId: string,
	password: string,
) => {
	await page.getByLabel('Name').fill('Ivy Invitee');
	await page.getByLabel('Create a password').fill(password);
	await page.getByRole('button', { name: 'Create Account' }).click();

	await expect(page).toHaveURL(`/?invite_success=true&planner=${plannerId}`);
};
