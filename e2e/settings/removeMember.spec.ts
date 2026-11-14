import { createUser } from '#factories/user';

import { expect, test } from '../_fixtures';
import { openSettings } from './_helpers/openSettings';

test('the owner removes a member', async ({ context, page }) => {
	const { planner, user: owner } = await openSettings(
		page,
		context,
		{ name: 'Olivia Owner' },
		{ name: 'Family Meals' },
	);
	const member = await createUser({
		name: 'Max Member',
		planners: [{ planner: planner._id, accessLevel: 'write' }],
	});
	// The member was added after Settings loaded, so reload to list them.
	await page.reload();

	await page.getByRole('tab', { name: 'Planner Settings' }).click();
	await page.getByRole('button', { name: 'Family Meals' }).click();
	const panel = page.getByRole('tabpanel', { name: 'Planner Settings' });
	await expect(panel.getByText(member.email)).toBeVisible();

	// The trash icon has no accessible name. The owner's row shows no actions,
	// so with one member this ID picks out the member's button.
	await page.getByTestId('remove-member-button').click();
	await page
		.getByRole('dialog', { name: 'Remove Max Member?' })
		.getByRole('button', { name: 'Remove', exact: true })
		.click();

	await expect(page.getByText(member.email)).toHaveCount(0);
	await expect(panel.getByText(owner.email)).toBeVisible();
});
