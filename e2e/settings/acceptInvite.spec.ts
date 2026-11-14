import { expect, test } from '../_fixtures';
import { signInToNewPlanner } from '../_helpers/signInToNewPlanner';
import { inviteToNewPlanner } from './_helpers/inviteToNewPlanner';

test('a user who accepts an invite has its planner in their list', async ({
	context,
	page,
}) => {
	// The invitee owns a planner too, so Settings loads for them.
	const { user: invitee } = await signInToNewPlanner(context, {
		accessLevel: 'owner',
		name: 'Solo Lunches',
		user: { name: 'Ivy Invitee' },
	});
	await inviteToNewPlanner(invitee.email);
	await page.goto('/settings');

	await page
		.getByRole('button', { name: 'Accept invitation to join Family Meals' })
		.click();

	await page.getByRole('tab', { name: 'Planner Settings' }).click();
	await expect(
		page.getByRole('button', { name: 'Family Meals', exact: true }),
	).toBeVisible();
});
