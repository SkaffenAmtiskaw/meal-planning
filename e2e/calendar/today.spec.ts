import { DateTime } from 'luxon';

import { expect, test } from '../_fixtures';
import { monthLabel } from './_helpers/calendarLabels';
import { mealOn } from './_helpers/mealOn';
import { openPlannerCalendar } from './_helpers/openPlannerCalendar';

const MEAL_NAME = "Persephone's Spring Risotto";

test('Today returns to the current month', async ({ context, page }) => {
	const now = DateTime.now();
	await openPlannerCalendar(page, context, {
		calendar: mealOn(now, MEAL_NAME),
	});

	await page.getByRole('button', { name: 'Next' }).click();
	await expect(
		page.getByText(monthLabel(now.plus({ months: 1 })), { exact: true }),
	).toBeVisible();

	await page.getByRole('button', { name: 'Today' }).click();

	// The header's label is plain text on desktop and the date picker button's text on phone.
	await expect(page.getByText(monthLabel(now), { exact: true })).toBeVisible();
	await expect(page.getByText(MEAL_NAME)).toBeVisible();
});
