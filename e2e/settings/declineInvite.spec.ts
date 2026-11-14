import { createPendingInvite } from '#factories/invite';
import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

import { expect, test } from '../_fixtures';
import { openSettings } from './_helpers/openSettings';

test('a user who declines an invite no longer has it pending', async ({
	context,
	page,
}) => {
	const invitedPlanner = await createPlanner({ name: 'Family Meals' });
	const owner = await createUser({
		name: 'Olivia Owner',
		planners: [{ planner: invitedPlanner._id, accessLevel: 'owner' }],
	});
	// The invitee owns a planner too, so Settings loads for them.
	const { user: invitee } = await openSettings(
		page,
		context,
		{ name: 'Ivy Invitee' },
		{ name: 'Solo Lunches' },
	);
	// getUserInvites matches the email exactly, so use it as createUser returned it.
	await createPendingInvite({
		planner: invitedPlanner._id,
		invitedBy: owner._id,
		email: invitee.email,
	});
	// The invite was written after Settings loaded, so reload to list it.
	await page.reload();

	await page
		.getByRole('button', { name: 'Decline invitation to join Family Meals' })
		.click();

	// The hidden Planner Settings tab shows its own "No pending invites", so
	// check within User Settings.
	const userSettings = page.getByRole('tabpanel', { name: 'User Settings' });
	await expect(userSettings.getByText('No pending invites')).toBeVisible();
	await expect(page.getByText('Family Meals', { exact: true })).toHaveCount(0);
});
