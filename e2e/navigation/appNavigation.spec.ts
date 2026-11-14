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
import { calendarPath, recipesListPath } from '../_helpers/plannerPaths';

const SIGN_IN_PROMPT = 'In order to use the meal planner, you must sign in.';
const SECOND_PLANNER_NAME = 'Solo Lunches';

// Opens the user menu from a planner's calendar. Until the invite badge's Suspense boundary streams in,
// the page holds a second, hidden copy of the avatar, so the helper waits for there to be one before
// clicking it.
const openUserMenu = async (page: Page) => {
	await expect(page.getByRole('grid')).toBeVisible();
	await expect(page.getByTestId('user-avatar')).toHaveCount(1);
	await page.getByTestId('user-avatar').click();
};

const logOut = async (page: Page) => {
	await openUserMenu(page);
	await page.getByRole('menuitem', { name: 'Log Out' }).click();
};

const openSettings = async (page: Page) => {
	await openUserMenu(page);
	await page.getByRole('menuitem', { name: 'Settings' }).click();
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
	const second = await createPlanner({ name: SECOND_PLANNER_NAME });
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

	await switchToPlanner(page, SECOND_PLANNER_NAME);

	await expect(page).toHaveURL(calendarPath(second._id));
});

test('opening the app returns to the planner switched to', async ({
	context,
	page,
}) => {
	const { second } = await openFirstOfTwoPlanners(page, context);
	await switchToPlanner(page, SECOND_PLANNER_NAME);
	await expect(page).toHaveURL(calendarPath(second._id));
	// The last opened planner's cookie is written in an effect once the calendar renders.
	await expect(page.getByRole('grid')).toBeVisible();

	await page.goto('/');

	await expect(page).toHaveURL(calendarPath(second._id));
});

test('moves between the calendar and recipes from the navbar', async ({
	context,
	page,
}) => {
	const planner = await openPlannerCalendar(page, context);
	await expect(page.getByRole('grid')).toBeVisible();

	await page.getByTestId('burger-toggle').click();
	await page.getByRole('link', { name: 'Recipes' }).click();
	await expect(page).toHaveURL(recipesListPath(planner._id));

	await page.getByRole('link', { name: 'Calendar' }).click();
	await expect(page).toHaveURL(calendarPath(planner._id));
});

test('opens Settings from the user menu', async ({ context, page }) => {
	await openPlannerCalendar(page, context);

	await openSettings(page);

	await expect(page).toHaveURL('/settings');
});

test('Settings back arrow returns to the last opened planner', async ({
	context,
	page,
}) => {
	const { second } = await openFirstOfTwoPlanners(page, context);
	await page.goto(calendarPath(second._id));
	// The last opened planner's cookie is written in an effect once the calendar renders.
	await expect(page.getByRole('grid')).toBeVisible();
	await openSettings(page);
	await expect(page).toHaveURL('/settings');

	await page.getByTestId('back-button').click();

	await expect(page).toHaveURL(calendarPath(second._id));
});
