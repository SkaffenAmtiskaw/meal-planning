import { createPendingInvite } from '#factories/invite';

import { expect, test } from '../_fixtures';
import { openPlannerSettings } from '../_helpers/openPlannerSettings';
import { signInToNewPlanner } from '../_helpers/signInToNewPlanner';

test('the owner cancels a pending invite', async ({ context, page }) => {
	const { planner, user: owner } = await signInToNewPlanner(context, {
		accessLevel: 'owner',
		name: 'Family Meals',
	});
	const invite = await createPendingInvite({
		planner: planner._id,
		invitedBy: owner._id,
	});
	await page.goto('/settings');

	let panel = await openPlannerSettings(page, 'Family Meals');
	await panel
		.getByRole('button', { name: `Cancel invite to ${invite.email}` })
		.click();

	// The list drops the invite before the server answers, so reload to see
	// what the server kept.
	await expect(panel.getByText(invite.email, { exact: true })).toHaveCount(0);
	await page.reload();
	panel = await openPlannerSettings(page, 'Family Meals');
	await expect(panel.getByText('No pending invites')).toBeVisible();
	await expect(panel.getByText(invite.email, { exact: true })).toHaveCount(0);
});
