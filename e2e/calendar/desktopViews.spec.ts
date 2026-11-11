import { DateTime } from 'luxon';

import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

import {
	type BrowserContext,
	expect,
	type Page,
	signIn,
	test,
} from '../_fixtures';

const MEAL_NAME = "Maleficent's Thorn Stew";

// Creates a planner with one meal today, signs in a member with write access, and opens its calendar.
const openCalendarWithMealToday = async (
	page: Page,
	context: BrowserContext,
) => {
	const planner = await createPlanner({
		calendar: [
			{
				date: DateTime.now().toISODate(),
				meals: [{ name: MEAL_NAME, dishes: [] }],
			},
		],
	});
	const user = await createUser({
		planners: [{ planner: planner._id, accessLevel: 'write' }],
	});
	await signIn(context, user);
	await page.goto(`/${planner._id}/calendar`);
};

test("month view shows the planner's meals", { tag: '@desktop-only' }, async ({
	context,
	page,
}) => {
	await openCalendarWithMealToday(page, context);

	const today = page.getByRole('gridcell', {
		name: `${DateTime.now().toFormat('MMMM d', { locale: 'en-US' })}, 1 meals`,
	});
	await expect(today).toContainText(MEAL_NAME);
});

test("view switcher opens week view with the planner's meals", {
	tag: '@desktop-only',
}, async ({ context, page }) => {
	await openCalendarWithMealToday(page, context);

	await page.getByText('Week', { exact: true }).click();

	// Week view's day columns are named by weekday and date, like "Tue 11/10", which month view's cells aren't.
	const now = DateTime.now();
	const today = page.getByRole('gridcell', {
		name: `${now.toFormat('ccc', { locale: 'en-US' })} ${now.month}/${now.day}, 1 meals`,
	});
	await expect(today).toContainText(MEAL_NAME);
});

test("view switcher opens list view with the planner's meals", {
	tag: '@desktop-only',
}, async ({ context, page }) => {
	await openCalendarWithMealToday(page, context);
	await expect(page.getByRole('grid')).toBeVisible();

	await page.getByText('List', { exact: true }).click();

	// List view is the only desktop view without a grid.
	await expect(page.getByRole('grid')).toHaveCount(0);
	await expect(page.getByText(MEAL_NAME)).toBeVisible();
});
