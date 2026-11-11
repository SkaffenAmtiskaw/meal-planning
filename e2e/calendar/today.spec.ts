import { DateTime } from 'luxon';

import { expect, test } from '../_fixtures';
import { openPlannerCalendar } from './_helpers/openPlannerCalendar';

const MEAL_NAME = "Persephone's Spring Risotto";

test('Today returns to the current month', async ({ context, page }) => {
	const now = DateTime.now();
	await openPlannerCalendar(page, context, {
		calendar: [
			{ date: now.toISODate(), meals: [{ name: MEAL_NAME, dishes: [] }] },
		],
	});

	const thisMonth = now.toFormat('MMMM yyyy', { locale: 'en-US' });
	const nextMonth = now
		.plus({ months: 1 })
		.toFormat('MMMM yyyy', { locale: 'en-US' });

	await page.getByRole('button', { name: 'Next' }).click();
	await expect(page.getByText(nextMonth, { exact: true })).toBeVisible();

	await page.getByRole('button', { name: 'Today' }).click();

	// The header's label is plain text on desktop and the date picker button's text on phone.
	await expect(page.getByText(thisMonth, { exact: true })).toBeVisible();
	await expect(page.getByText(MEAL_NAME)).toBeVisible();
});
