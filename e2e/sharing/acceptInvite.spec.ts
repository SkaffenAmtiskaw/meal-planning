import { uniqueEmail } from '#factories/uniqueEmail';

import {
	type BrowserContext,
	expect,
	latestEmailTo,
	linkInEmail,
	type Page,
	test,
} from '../_fixtures';
import { openPlannerSettings } from '../_helpers/openPlannerSettings';
import { signInToNewPlanner } from '../_helpers/signInToNewPlanner';
import { trySignInWithPassword } from '../_helpers/trySignInWithPassword';
import { signUpFromInvite } from './_helpers/signUpFromInvite';

const PASSWORD = 'e2e-password';

// The owner of "Family Meals" invites a new address on Settings, then the invitee opens the emailed link
// signed out. signUpWithInvite sets no session, so a leftover owner cookie would land on the owner's planner.
const openInviteFromEmail = async (context: BrowserContext, page: Page) => {
	const inviteeEmail = uniqueEmail();
	const { planner } = await signInToNewPlanner(context, {
		accessLevel: 'owner',
		name: 'Family Meals',
	});
	await page.goto('/settings');
	const panel = await openPlannerSettings(page, 'Family Meals');
	await panel.getByLabel('Email address').fill(inviteeEmail);
	await panel.getByRole('button', { name: 'Invite', exact: true }).click();

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

	await signUpFromInvite(page, planner._id.toString(), PASSWORD);
	await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();

	// Signing in through the request shares the page's cookies, so the session carries over to the next page.
	expect(await trySignInWithPassword(page, inviteeEmail, PASSWORD)).toBe(true);
	await page.goto('/');

	await expect(page).toHaveURL(`/${planner._id}/calendar`);
});
