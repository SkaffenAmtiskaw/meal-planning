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

const MEAL_NAME = "Hades' Pomegranate Salad";

// Creates a planner with one meal on the given date, signs in a member with write access, and opens its calendar.
const openCalendarWithMealOn = async (
	page: Page,
	context: BrowserContext,
	date: DateTime<true>,
) => {
	const planner = await createPlanner({
		calendar: [
			{
				date: date.toISODate(),
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
	await openCalendarWithMealOn(page, context, nextMonth);
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
	await openCalendarWithMealOn(page, context, nextWeek);

	await page.getByText('Week', { exact: true }).click();
	await expect(headerLabel(page, weekLabel(now))).toBeVisible();

	await page.getByRole('button', { name: 'Next' }).click();

	await expect(headerLabel(page, weekLabel(nextWeek))).toBeVisible();
	await expect(page.getByText(MEAL_NAME)).toBeVisible();

	await page.getByRole('button', { name: 'Previous' }).click();

	await expect(headerLabel(page, weekLabel(now))).toBeVisible();
});
