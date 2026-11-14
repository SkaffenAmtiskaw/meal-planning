import { uniqueEmail } from '#factories/uniqueEmail';

import { expect, latestEmailTo, test } from '../_fixtures';
import { signInToNewPlanner } from '../_helpers/signInToNewPlanner';
import { openPlannerSettings } from './_helpers/openPlannerSettings';

test('the owner sends an invite and it shows as pending', async ({
	context,
	page,
}) => {
	const inviteeEmail = uniqueEmail();
	await signInToNewPlanner(context, {
		accessLevel: 'owner',
		name: 'Family Meals',
	});
	await page.goto('/settings');
	const panel = await openPlannerSettings(page, 'Family Meals');

	await panel.getByLabel('Email address').fill(inviteeEmail);
	await panel.getByRole('button', { name: 'Invite', exact: true }).click();

	const email = await latestEmailTo(inviteeEmail);
	expect(email.subject).toBe(
		"You've been invited to join Family Meals on Meal Planner",
	);
	await expect(panel.getByText(inviteeEmail, { exact: true })).toBeVisible();
});
