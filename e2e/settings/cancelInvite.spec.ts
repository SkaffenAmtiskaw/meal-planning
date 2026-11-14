import { createPendingInvite } from '#factories/invite';

import { expect, type Page, test } from '../_fixtures';
import { openSettings } from './_helpers/openSettings';

const openPlanner = async (page: Page) => {
	await page.getByRole('tab', { name: 'Planner Settings' }).click();
	await page.getByRole('button', { name: 'Family Meals' }).click();
	return page.getByRole('tabpanel', { name: 'Planner Settings' });
};

test('the owner cancels a pending invite', async ({ context, page }) => {
	const { planner, user: owner } = await openSettings(
		page,
		context,
		{},
		{ name: 'Family Meals' },
	);
	const invite = await createPendingInvite({
		planner: planner._id,
		invitedBy: owner._id,
	});
	// The invite was written after Settings loaded, so reload to list it.
	await page.reload();

	let panel = await openPlanner(page);
	await panel
		.getByRole('button', { name: `Cancel invite to ${invite.email}` })
		.click();

	// The list drops the invite before the server answers, so reload to see
	// what the server kept.
	await expect(panel.getByText(invite.email, { exact: true })).toHaveCount(0);
	await page.reload();
	panel = await openPlanner(page);
	await expect(panel.getByText('No pending invites')).toBeVisible();
	await expect(panel.getByText(invite.email, { exact: true })).toHaveCount(0);
});
