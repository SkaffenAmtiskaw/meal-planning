import { createPendingInvite } from '#factories/invite';
import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

import { expect, test } from '../_fixtures';

// Viewing an expired invite deletes it (validateInviteToken), so the test opens the link only once.
test('an expired invite says it has expired', async ({ page }) => {
	const planner = await createPlanner({ name: 'Family Meals' });
	const owner = await createUser({
		planners: [{ planner: planner._id, accessLevel: 'owner' }],
	});
	const { token, email } = await createPendingInvite({
		planner: planner._id,
		invitedBy: owner._id,
		expiresAt: new Date(Date.now() - 60 * 1000),
	});

	await page.goto(`/invite?token=${token}`);

	await expect(page.getByText('This invite has expired')).toBeVisible();
	await expect(
		page.getByText(`You can still create an account or sign in with ${email}`),
	).toBeVisible();
});
