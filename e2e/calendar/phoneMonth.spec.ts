import { DateTime } from 'luxon';

import { expect, test } from '../_fixtures';
import { openPlannerCalendar } from './_helpers/openPlannerCalendar';

const MEAL_NAME = "Hades' Pomegranate Glaze";

test("phone month view shows the day's meals", {
	tag: '@phone-only',
}, async ({ context, page }) => {
	await openPlannerCalendar(page, context, {
		calendar: [
			{
				date: DateTime.now().toISODate(),
				meals: [{ name: MEAL_NAME, dishes: [] }],
			},
		],
	});

	// The agenda card has no role or name to find it by.
	await expect(
		page.getByTestId('meal-card').filter({ hasText: MEAL_NAME }),
	).toBeVisible();
});
