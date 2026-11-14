import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

import { expect, signIn, test } from '../_fixtures';

test('a member who leaves a planner no longer has it in their list', async ({
	context,
	page,
}) => {
	const sharedPlanner = await createPlanner({ name: 'Family Meals' });
	// The member owns a planner too, so Settings still loads after they leave.
	const ownPlanner = await createPlanner({ name: 'Solo Lunches' });
	await createUser({
		name: 'Olivia Owner',
		planners: [{ planner: sharedPlanner._id, accessLevel: 'owner' }],
	});
	const member = await createUser({
		name: 'Max Member',
		planners: [
			{ planner: ownPlanner._id, accessLevel: 'owner' },
			{ planner: sharedPlanner._id, accessLevel: 'write' },
		],
	});
	await signIn(context, member);
	await page.goto('/settings');

	await page.getByRole('tab', { name: 'Planner Settings' }).click();
	await page.getByRole('button', { name: 'Family Meals' }).click();

	await page.getByRole('button', { name: 'Leave Planner' }).click();
	await page
		.getByRole('dialog')
		.getByRole('button', { name: 'Leave Planner' })
		.click();

	await expect(page.getByRole('button', { name: 'Family Meals' })).toHaveCount(
		0,
	);
	await expect(
		page.getByRole('button', { name: 'Solo Lunches' }),
	).toBeVisible();
});
