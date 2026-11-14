import { createPendingInvite } from '#factories/invite';
import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

import { expect, test } from '../_fixtures';
import { openSettings } from './_helpers/openSettings';

test('a user who accepts an invite has its planner in their list', async ({
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
		.getByRole('button', { name: 'Accept invitation to join Family Meals' })
		.click();

	await page.getByRole('tab', { name: 'Planner Settings' }).click();
	await expect(
		page.getByRole('button', { name: 'Family Meals', exact: true }),
	).toBeVisible();
});
