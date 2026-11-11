import { DateTime } from 'luxon';

import { expect, test } from '../_fixtures';
import { mealOn } from './_helpers/mealOn';
import { openPlannerCalendar } from './_helpers/openPlannerCalendar';

const MEAL_NAME = "Hades' Pomegranate Glaze";

test("phone month view shows the day's meals", {
	tag: '@phone-only',
}, async ({ context, page }) => {
	await openPlannerCalendar(page, context, {
		calendar: mealOn(DateTime.now(), MEAL_NAME),
	});

	// The phone grid marks a day's meals with dots, so the meal's name shows only in the agenda.
	await expect(page.getByText(MEAL_NAME)).toBeVisible();
});
