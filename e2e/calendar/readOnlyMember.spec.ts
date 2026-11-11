import { DateTime } from 'luxon';

import { expect, test } from '../_fixtures';
import { monthCellName, weekCellName } from './_helpers/calendarLabels';
import { mealOn } from './_helpers/mealOn';
import { openPlannerCalendar } from './_helpers/openPlannerCalendar';

const MEAL_NAME = "Cinderella's Pumpkin Soup";

test('read-only member sees meals and no add controls on desktop', {
	tag: '@desktop-only',
}, async ({ context, page }) => {
	const now = DateTime.now();
	await openPlannerCalendar(page, context, {
		accessLevel: 'read',
		calendar: mealOn(now, MEAL_NAME),
	});

	const monthToday = page.getByRole('gridcell', {
		name: monthCellName(now, 1),
	});
	await expect(monthToday).toContainText(MEAL_NAME);
	await expect(page.getByRole('button', { name: 'Add Meal' })).toHaveCount(0);

	// The switcher's radio inputs are hidden, so a user clicks, and the spec finds, each option's text.
	await page.getByText('Week', { exact: true }).click();
	const weekToday = page.getByRole('gridcell', { name: weekCellName(now, 1) });
	await expect(weekToday).toContainText(MEAL_NAME);

	await page.getByText('List', { exact: true }).click();
	const todayRow = page.getByRole('listitem').filter({ hasText: MEAL_NAME });
	await expect(todayRow).toBeVisible();
	// The row's add control has no accessible name and shows only on hover, so a count of all buttons is what catches it.
	await expect(todayRow.getByRole('button')).toHaveCount(0);
	// A day with no meals offers an "Add meal" row instead, which isn't a button.
	await expect(page.getByText('Add meal', { exact: true })).toHaveCount(0);
});

test('read-only member sees meals and no add controls on phone', {
	tag: '@phone-only',
}, async ({ context, page }) => {
	await openPlannerCalendar(page, context, {
		accessLevel: 'read',
		calendar: mealOn(DateTime.now(), MEAL_NAME),
	});

	await expect(page.getByText(MEAL_NAME)).toBeVisible();
	await expect(page.getByRole('button', { name: 'Add Meal' })).toHaveCount(0);
});
