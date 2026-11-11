import { DateTime } from 'luxon';

import { expect, test } from '../_fixtures';
import { monthCellName, weekCellName } from './_helpers/calendarLabels';
import { mealOn } from './_helpers/mealOn';
import { openPlannerCalendar } from './_helpers/openPlannerCalendar';

const MEAL_NAME = "Maleficent's Thorn Stew";

test("month view shows the planner's meals", { tag: '@desktop-only' }, async ({
	context,
	page,
}) => {
	const now = DateTime.now();
	await openPlannerCalendar(page, context, {
		calendar: mealOn(now, MEAL_NAME),
	});

	const today = page.getByRole('gridcell', { name: monthCellName(now, 1) });
	await expect(today).toContainText(MEAL_NAME);
});

test("view switcher opens week view with the planner's meals", {
	tag: '@desktop-only',
}, async ({ context, page }) => {
	const now = DateTime.now();
	await openPlannerCalendar(page, context, {
		calendar: mealOn(now, MEAL_NAME),
	});

	// The switcher's radio inputs are hidden, so a user clicks, and the spec finds, each option's text.
	await page.getByText('Week', { exact: true }).click();

	// Week view's day columns are named by weekday and date, like "Tue 11/10", which month view's cells aren't.
	const today = page.getByRole('gridcell', { name: weekCellName(now, 1) });
	await expect(today).toContainText(MEAL_NAME);
});

test("view switcher opens list view and returns to month view with the planner's meals", {
	tag: '@desktop-only',
}, async ({ context, page }) => {
	const now = DateTime.now();
	await openPlannerCalendar(page, context, {
		calendar: mealOn(now, MEAL_NAME),
	});

	// The switcher's radio inputs are hidden, so a user clicks, and the spec finds, each option's text.
	await page.getByText('List', { exact: true }).click();

	await expect(
		page.getByRole('listitem').filter({ hasText: MEAL_NAME }),
	).toBeVisible();

	await page.getByText('Month', { exact: true }).click();

	const today = page.getByRole('gridcell', { name: monthCellName(now, 1) });
	await expect(today).toContainText(MEAL_NAME);
});
