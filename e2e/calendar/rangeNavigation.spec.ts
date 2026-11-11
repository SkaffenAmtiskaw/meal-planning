import { DateTime } from 'luxon';

import { expect, type Page, test } from '../_fixtures';
import { openPlannerCalendar } from './_helpers/openPlannerCalendar';

const MEAL_NAME = "Hades' Pomegranate Salad";

// One day holding the meal, for openPlannerCalendar's calendar override.
const mealOn = (date: DateTime<true>) => [
	{ date: date.toISODate(), meals: [{ name: MEAL_NAME, dishes: [] }] },
];

// The header's label as a user reads it: plain text on desktop, the date picker button's text on phone.
const headerLabel = (page: Page, label: string) =>
	page.getByText(label, { exact: true });

const monthLabel = (date: DateTime) =>
	date.toFormat('MMMM yyyy', { locale: 'en-US' });

// Weeks run Sunday to Saturday, labelled like "Nov 8 – Nov 14, 2026", or "Dec 27, 2026 – Jan 2, 2027" across a new year.
const weekLabel = (date: DateTime) => {
	const start = date.startOf('day').minus({ days: date.weekday % 7 });
	const end = start.plus({ days: 6 });
	const format = (day: DateTime) => day.toFormat('MMM d', { locale: 'en-US' });
	if (start.year === end.year) {
		return `${format(start)} – ${format(end)}, ${end.year}`;
	}
	return `${format(start)}, ${start.year} – ${format(end)}, ${end.year}`;
};

test('previous and next move the month and its label', async ({
	context,
	page,
}) => {
	const now = DateTime.now();
	// Next moves the selected date by exactly a month, and phone month view lists only the selected day's meals.
	const nextMonth = now.plus({ months: 1 });
	await openPlannerCalendar(page, context, { calendar: mealOn(nextMonth) });
	await expect(headerLabel(page, monthLabel(now))).toBeVisible();

	await page.getByRole('button', { name: 'Next' }).click();

	await expect(headerLabel(page, monthLabel(nextMonth))).toBeVisible();
	await expect(page.getByText(MEAL_NAME)).toBeVisible();

	await page.getByRole('button', { name: 'Previous' }).click();

	await expect(headerLabel(page, monthLabel(now))).toBeVisible();
});

test('previous and next move the week and its label', {
	tag: '@desktop-only',
}, async ({ context, page }) => {
	const now = DateTime.now();
	const nextWeek = now.plus({ days: 7 });
	await openPlannerCalendar(page, context, { calendar: mealOn(nextWeek) });

	await page.getByText('Week', { exact: true }).click();
	await expect(headerLabel(page, weekLabel(now))).toBeVisible();

	await page.getByRole('button', { name: 'Next' }).click();

	await expect(headerLabel(page, weekLabel(nextWeek))).toBeVisible();
	await expect(page.getByText(MEAL_NAME)).toBeVisible();

	await page.getByRole('button', { name: 'Previous' }).click();

	await expect(headerLabel(page, weekLabel(now))).toBeVisible();
});
