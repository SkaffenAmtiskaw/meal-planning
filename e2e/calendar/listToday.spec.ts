import { DateTime } from 'luxon';

import { expect, test } from '../_fixtures';
import { openPlannerCalendar } from '../_helpers/openPlannerCalendar';
import { mealOn } from './_helpers/mealOn';

const MEAL_NAME = "Hestia's Hearth Stew";

test('Today scrolls the desktop list back to today', {
	tag: '@desktop-only',
}, async ({ context, page }) => {
	const now = DateTime.now();
	await openPlannerCalendar(page, context, {
		calendar: mealOn(now, MEAL_NAME),
	});
	// The switcher's radio inputs are hidden, so a user clicks, and the spec finds, each option's text.
	await page.getByText('List', { exact: true }).click();
	const meal = page.getByText(MEAL_NAME);
	const dateField = page.getByRole('button', { name: 'Date' });
	await expect(meal).toBeInViewport();

	await meal.hover();
	await page.mouse.wheel(0, 2000);
	await expect(meal).not.toBeInViewport();
	await expect(dateField).not.toHaveText(now.toFormat('M/d/yyyy'));

	await page.getByRole('button', { name: 'Today' }).click();

	await expect(meal).toBeInViewport();
	await expect(dateField).toHaveText(now.toFormat('M/d/yyyy'));
});
