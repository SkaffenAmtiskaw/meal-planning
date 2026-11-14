import { expect, signIn, test } from '../_fixtures';
import { openPlannerSettings } from '../_helpers/openPlannerSettings';
import { createSharedPlanner } from './_helpers/createSharedPlanner';

test('the owner removes a member', async ({ context, page }) => {
	const { owner, member } = await createSharedPlanner();
	await signIn(context, owner);
	await page.goto('/settings');
	const panel = await openPlannerSettings(page, 'Family Meals');
	await expect(panel.getByText(member.email)).toBeVisible();

	// The trash icon has no accessible name. The owner's row shows no actions,
	// so with one member this ID picks out the member's button.
	await page.getByTestId('remove-member-button').click();
	await page
		.getByRole('dialog', { name: 'Remove Max Member?' })
		.getByRole('button', { name: 'Remove', exact: true })
		.click();

	await expect(panel.getByText(member.email)).toHaveCount(0);
	await expect(panel.getByText(owner.email)).toBeVisible();
});
