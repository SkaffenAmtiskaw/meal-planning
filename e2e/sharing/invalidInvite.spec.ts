import { expect, type Page, test } from '../_fixtures';
import { inviteToNewPlanner } from '../_helpers/inviteToNewPlanner';
import { signUpFromInvite } from './_helpers/signUpFromInvite';

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
	} = await inviteToNewPlanner();

	await page.goto(`/invite?token=${token}`);
	await signUpFromInvite(page, planner._id.toString(), 'e2e-password');

	await page.goto(`/invite?token=${token}`);

	await expectInvalidInviteLeadsToSignIn(page);
});

test('a bad token shows Invalid Invite', async ({ page }) => {
	await page.goto(`/invite?token=${crypto.randomUUID()}`);

	await expectInvalidInviteLeadsToSignIn(page);
});
