import { DateTime } from 'luxon';

import { expect, test } from '../_fixtures';
import { openPlannerCalendar } from './_helpers/openPlannerCalendar';

const MEAL_NAME = "Cinderella's Pumpkin Soup";

const calendarWithMealToday = () => [
	{
		date: DateTime.now().toISODate(),
		meals: [{ name: MEAL_NAME, dishes: [] }],
	},
];

test('read-only member sees meals and no add controls on desktop', {
	tag: '@desktop-only',
}, async ({ context, page }) => {
	await openPlannerCalendar(page, context, {
		accessLevel: 'read',
		calendar: calendarWithMealToday(),
	});
	const now = DateTime.now();

	const monthToday = page.getByRole('gridcell', {
		name: `${now.toFormat('MMMM d', { locale: 'en-US' })}, 1 meals`,
	});
	await expect(monthToday).toContainText(MEAL_NAME);
	await expect(page.getByRole('button', { name: 'Add Meal' })).toHaveCount(0);

	await page.getByText('Week', { exact: true }).click();
	const weekToday = page.getByRole('gridcell', {
		name: `${now.toFormat('ccc', { locale: 'en-US' })} ${now.month}/${now.day}, 1 meals`,
	});
	await expect(weekToday).toContainText(MEAL_NAME);

	await page.getByText('List', { exact: true }).click();
	const todayRow = page.getByRole('listitem').filter({ hasText: MEAL_NAME });
	await expect(todayRow).toBeVisible();
	// The row's add control has no accessible name and shows only on hover, so a count of all buttons is what catches it.
	await expect(todayRow.getByRole('button')).toHaveCount(0);
});

test('read-only member sees meals and no add controls on phone', {
	tag: '@phone-only',
}, async ({ context, page }) => {
	await openPlannerCalendar(page, context, {
		accessLevel: 'read',
		calendar: calendarWithMealToday(),
	});

	// The agenda card has no role or name to find it by.
	await expect(
		page.getByTestId('meal-card').filter({ hasText: MEAL_NAME }),
	).toBeVisible();
	await expect(page.getByRole('button', { name: 'Add Meal' })).toHaveCount(0);
});
