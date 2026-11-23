import { DateTime } from 'luxon';

import { expect, type Page, test } from '../_fixtures';
import { openPlannerCalendar } from '../_helpers/openPlannerCalendar';
import { monthLabel } from './_helpers/calendarLabels';

// A picker day button's accessible name, like "15 December 2026", which Mantine gives it.
const pickerDay = (page: Page, date: DateTime) =>
	page.getByRole('dialog').getByRole('button', {
		name: date.toFormat('d MMMM yyyy', { locale: 'en-US' }),
	});

test('picking a date in the desktop Date field moves the calendar there', {
	tag: '@desktop-only',
}, async ({ context, page }) => {
	const now = DateTime.now();
	const target = now.plus({ months: 1 }).set({ day: 15 });
	await openPlannerCalendar(page, context);

	const dateField = page.getByRole('button', { name: 'Date' });
	await expect(dateField).toHaveText(now.toFormat('M/d/yyyy'));

	await dateField.click();
	await page.getByRole('button', { name: 'Next month' }).click();
	await pickerDay(page, target).click();

	await expect(page.getByRole('dialog')).toBeHidden();
	await expect(dateField).toHaveText(target.toFormat('M/d/yyyy'));
	await expect(
		page.getByText(monthLabel(target), { exact: true }),
	).toBeVisible();
});

test('picking a date from the phone period label moves the calendar there', {
	tag: '@phone-only',
}, async ({ context, page }) => {
	const now = DateTime.now();
	const target = now.plus({ months: 1 }).set({ day: 15 });
	await openPlannerCalendar(page, context);

	await page.getByRole('button', { name: monthLabel(now) }).click();
	await page.getByRole('button', { name: 'Next month' }).click();
	await pickerDay(page, target).click();

	await expect(page.getByRole('dialog')).toBeHidden();
	await expect(
		page.getByRole('button', { name: monthLabel(target) }),
	).toBeVisible();
});
