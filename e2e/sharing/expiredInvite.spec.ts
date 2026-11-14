import { expect, test } from '../_fixtures';
import { createOwnersInvite } from './_helpers/createOwnersInvite';

// Viewing an expired invite deletes it (validateInviteToken), so the test opens the link only once.
test('an expired invite says it has expired', async ({ page }) => {
	const {
		invite: { token, email },
	} = await createOwnersInvite({
		expiresAt: new Date(Date.now() - 60 * 1000),
	});

	await page.goto(`/invite?token=${token}`);

	await expect(page.getByText('This invite has expired')).toBeVisible();
	await expect(
		page.getByText(`You can still create an account or sign in with ${email}`),
	).toBeVisible();
});
