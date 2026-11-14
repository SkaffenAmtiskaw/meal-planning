import { expect, type Page, test } from '../_fixtures';
import { openPlannerCalendar } from '../_helpers/openPlannerCalendar';
import { calendarPath } from '../_helpers/plannerPaths';

const SIGN_IN_PROMPT = 'In order to use the meal planner, you must sign in.';

// Logs out from the user menu. Until the invite badge's Suspense boundary streams in, the page holds a
// second, hidden copy of the avatar, so the helper waits for there to be one before clicking it.
const logOut = async (page: Page) => {
	await expect(page.getByRole('grid')).toBeVisible();
	await expect(page.getByTestId('user-avatar')).toHaveCount(1);
	await page.getByTestId('user-avatar').click();
	await page.getByRole('menuitem', { name: 'Log Out' }).click();
};

test('logs out from the user menu', async ({ context, page }) => {
	await openPlannerCalendar(page, context);

	await logOut(page);

	await expect(page).toHaveURL('/');
	await expect(page.getByText(SIGN_IN_PROMPT)).toBeVisible();
});

test("a logged-out user can't open their planner", async ({
	context,
	page,
}) => {
	const planner = await openPlannerCalendar(page, context);
	await logOut(page);
	await expect(page.getByText(SIGN_IN_PROMPT)).toBeVisible();

	await page.goto(calendarPath(planner._id));

	await expect(page).toHaveURL('/');
	await expect(page.getByText(SIGN_IN_PROMPT)).toBeVisible();
	await expect(page.getByRole('grid')).toBeHidden();
});
