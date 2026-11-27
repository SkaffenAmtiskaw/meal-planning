import { DateTime } from 'luxon';

import { expect, type Page } from '../../_fixtures';

type MealFormFields = {
	// An ISO date, YYYY-MM-DD, which the helper picks in the Date field's picker.
	date: string;
	name: string;
	description: string;
};

// The open Add Meal form. Found by its title, since the Date field's picker is a dialog too.
const mealForm = (page: Page) => page.getByRole('dialog', { name: 'Add Meal' });

// Picks a day in the open Date picker, paging from the month it shows to the day's month.
const pickDate = async (page: Page, date: DateTime) => {
	const picker = page
		.getByRole('dialog')
		.filter({ has: page.getByRole('button', { name: 'Next month' }) });
	// The picker's month title, like "November 2026". A day button's name starts with its day number.
	const title = picker.getByRole('button', { name: /^[A-Za-z]+ \d{4}$/ });
	const shown = DateTime.fromFormat(await title.innerText(), 'MMMM yyyy', {
		locale: 'en-US',
	});
	const months = date.startOf('month').diff(shown, 'months').months;
	const pager = picker.getByRole('button', {
		name: months > 0 ? 'Next month' : 'Previous month',
	});
	for (let i = 0; i < Math.abs(months); i++) {
		await pager.click();
	}

	// A day button's accessible name, like "15 December 2026", which Mantine gives it.
	await picker
		.getByRole('button', {
			name: date.toFormat('d MMMM yyyy', { locale: 'en-US' }),
		})
		.click();
	await expect(picker).toBeHidden();
};

// Fills the open Add Meal form's date, name and description, on desktop or phone.
export const fillMealForm = async (
	page: Page,
	{ date, name, description }: MealFormFields,
) => {
	const form = mealForm(page);
	await form.getByRole('button', { name: 'Date' }).click();
	await pickDate(page, DateTime.fromISO(date));
	await form.getByRole('textbox', { name: 'Meal name' }).fill(name);
	await form.getByRole('textbox', { name: 'Description' }).fill(description);
};

// Saves the open Add Meal form.
export const saveMealForm = async (page: Page) => {
	await mealForm(page).getByRole('button', { name: 'Add Meal' }).click();
};
