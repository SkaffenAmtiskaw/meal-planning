import { uniqueEmail } from '#factories/uniqueEmail';

import {
	type BrowserContext,
	expect,
	latestEmailTo,
	linkInEmail,
	type Page,
	signInWithPassword,
	test,
} from '../_fixtures';
import { signInToNewPlanner } from '../_helpers/signInToNewPlanner';

// The owner of "Family Meals" invites a new address on Settings, then the invitee opens the emailed link
// signed out. signUpWithInvite sets no session, so a leftover owner cookie would land on the owner's planner.
const openInviteFromEmail = async (context: BrowserContext, page: Page) => {
	const inviteeEmail = uniqueEmail();
	const { planner } = await signInToNewPlanner(context, {
		accessLevel: 'owner',
		name: 'Family Meals',
	});
	await page.goto('/settings');
	await page.getByRole('tab', { name: 'Planner Settings' }).click();
	await page.getByRole('button', { name: 'Family Meals', exact: true }).click();
	await page.getByLabel('Email address').fill(inviteeEmail);
	await page.getByRole('button', { name: 'Invite', exact: true }).click();

	const link = linkInEmail(await latestEmailTo(inviteeEmail));
	await context.clearCookies();
	await page.goto(link);

	return { inviteeEmail, planner };
};

test('the invite link opens sign-up for the planner', async ({
	context,
	page,
}) => {
	const { inviteeEmail } = await openInviteFromEmail(context, page);

	await expect(
		page.getByText('In order to join Family Meals you must create an account.'),
	).toBeVisible();
	await expect(page.getByText(inviteeEmail, { exact: true })).toBeVisible();
	await expect(page.getByLabel('Name')).toBeVisible();
	await expect(page.getByLabel('Create a password')).toBeVisible();
});

test('signing up adds the user to the planner', async ({ context, page }) => {
	const { inviteeEmail, planner } = await openInviteFromEmail(context, page);

	await page.getByLabel('Name').fill('Ivy Invitee');
	await page.getByLabel('Create a password').fill('e2e-password');
	await page.getByRole('button', { name: 'Create Account' }).click();

	await expect(page).toHaveURL(`/?invite_success=true&planner=${planner._id}`);
	await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();

	await signInWithPassword(page, inviteeEmail, 'e2e-password');

	await expect(page).toHaveURL(`/${planner._id}/calendar`);
});
