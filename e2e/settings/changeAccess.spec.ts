import { expect, signIn, test } from '../_fixtures';
import { openPlannerSettings } from '../_helpers/openPlannerSettings';
import { createSharedPlanner } from './_helpers/createSharedPlanner';

test("the owner changes a member's access level", async ({ context, page }) => {
	const { owner } = await createSharedPlanner();
	await signIn(context, owner);
	await page.goto('/settings');
	await openPlannerSettings(page, 'Family Meals');

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
