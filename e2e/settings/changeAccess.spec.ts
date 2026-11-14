import { createUser } from '#factories/user';

import { expect, test } from '../_fixtures';
import { openSettings } from './_helpers/openSettings';

test("the owner changes a member's access level", async ({ context, page }) => {
	const { planner } = await openSettings(
		page,
		context,
		{ name: 'Olivia Owner' },
		{ name: 'Family Meals' },
	);
	await createUser({
		name: 'Max Member',
		planners: [{ planner: planner._id, accessLevel: 'write' }],
	});
	// The member was added after Settings loaded, so reload to list them.
	await page.reload();

	await page.getByRole('tab', { name: 'Planner Settings' }).click();
	await page.getByRole('button', { name: 'Family Meals' }).click();

	// The pencil, the select and the save tick have no accessible names. The
	// owner's row shows no actions, so these IDs pick out the member's controls.
	await page.getByTestId('edit-access-level').click();
	await page.getByTestId('access-level-select').click();
	await page.getByRole('option', { name: 'read', exact: true }).click();
	await page.getByTestId('save-access-level').click();

	const badges = page.getByTestId('access-level-badge');
	await expect(badges.filter({ hasText: /^read$/ })).toBeVisible();
	await expect(badges.filter({ hasText: /^write$/ })).toHaveCount(0);
});
