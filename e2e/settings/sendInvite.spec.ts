import { uniqueEmail } from '#factories/uniqueEmail';

import { expect, latestEmailTo, test } from '../_fixtures';
import { openSettings } from './_helpers/openSettings';

test('the owner sends an invite and it shows as pending', async ({
	context,
	page,
}) => {
	const inviteeEmail = uniqueEmail();
	await openSettings(page, context, {}, { name: 'Family Meals' });

	await page.getByRole('tab', { name: 'Planner Settings' }).click();
	await page.getByRole('button', { name: 'Family Meals' }).click();
	const panel = page.getByRole('tabpanel', { name: 'Planner Settings' });
	await panel.getByLabel('Email address').fill(inviteeEmail);
	await panel.getByRole('button', { name: 'Invite', exact: true }).click();

	const email = await latestEmailTo(inviteeEmail);
	expect(email.subject).toBe(
		"You've been invited to join Family Meals on Meal Planner",
	);
	await expect(panel.getByText(inviteeEmail, { exact: true })).toBeVisible();
});
