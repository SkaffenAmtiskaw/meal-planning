import { expect, test } from '../_fixtures';
import { inviteToNewPlanner } from '../_helpers/inviteToNewPlanner';
import { signInToNewPlanner } from '../_helpers/signInToNewPlanner';

test('a user who declines an invite no longer has it pending', async ({
	context,
	page,
}) => {
	// The invitee owns a planner too, so Settings loads for them.
	const { user: invitee } = await signInToNewPlanner(context, {
		accessLevel: 'owner',
		name: 'Solo Lunches',
		user: { name: 'Ivy Invitee' },
	});
	await inviteToNewPlanner({ email: invitee.email });
	await page.goto('/settings');

	await page
		.getByRole('button', { name: 'Decline invitation to join Family Meals' })
		.click();

	// The hidden Planner Settings tab shows its own "No pending invites", so
	// check within User Settings.
	const userSettings = page.getByRole('tabpanel', { name: 'User Settings' });
	await expect(userSettings.getByText('No pending invites')).toBeVisible();
	await expect(page.getByText('Family Meals', { exact: true })).toHaveCount(0);
});
