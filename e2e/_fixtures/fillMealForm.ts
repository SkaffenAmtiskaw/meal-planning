import type { Page } from '@playwright/test';

type MealFormFields = {
	// An ISO date, YYYY-MM-DD, since the field is a native date input.
	date: string;
	name: string;
	description: string;
};

// Fills the open Add Meal form's date, name and description, on desktop or phone.
export const fillMealForm = async (
	page: Page,
	{ date, name, description }: MealFormFields,
) => {
	// Scoped to the dialog, because the desktop header has a "Date" picker of its own.
	const form = page.getByRole('dialog');
	// A date input has no textbox role, so it's found by its label.
	await form.getByLabel('Date').fill(date);
	await form.getByRole('textbox', { name: 'Meal name' }).fill(name);
	await form.getByRole('textbox', { name: 'Description' }).fill(description);
};

// Saves the open Add Meal form.
export const saveMealForm = async (page: Page) => {
	await page
		.getByRole('dialog')
		.getByRole('button', { name: 'Add Meal' })
		.click();
};
