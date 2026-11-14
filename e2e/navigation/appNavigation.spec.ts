import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

import {
	type BrowserContext,
	expect,
	type Page,
	signIn,
	test,
} from '../_fixtures';
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

// Signs in a user in two named planners, opens the first one's calendar, and returns both planners.
const openFirstOfTwoPlanners = async (page: Page, context: BrowserContext) => {
	const first = await createPlanner({ name: 'Family Meals' });
	const second = await createPlanner({ name: 'Solo Lunches' });
	const user = await createUser({
		planners: [
			{ planner: first._id, accessLevel: 'owner' },
			{ planner: second._id, accessLevel: 'owner' },
		],
	});
	await signIn(context, user);
	await page.goto(calendarPath(first._id));
	await expect(page.getByRole('grid')).toBeVisible();

	return { first, second };
};

// Opens the navbar with the burger, then picks the named planner from the planner switcher.
const switchToPlanner = async (page: Page, name: string) => {
	await page.getByTestId('burger-toggle').click();
	await page.getByTestId('planner-context-trigger').click();
	await page.getByRole('menuitem', { name }).click();
};

test('switches planners from the navbar', async ({ context, page }) => {
	const { second } = await openFirstOfTwoPlanners(page, context);

	await switchToPlanner(page, 'Solo Lunches');

	await expect(page).toHaveURL(calendarPath(second._id));
});

test('opening the app returns to the planner switched to', async ({
	context,
	page,
}) => {
	const { second } = await openFirstOfTwoPlanners(page, context);
	await switchToPlanner(page, 'Solo Lunches');
	await expect(page).toHaveURL(calendarPath(second._id));
	// The last opened planner's cookie is written in an effect once the calendar renders.
	await expect(page.getByRole('grid')).toBeVisible();

	await page.goto('/');

	await expect(page).toHaveURL(calendarPath(second._id));
});
