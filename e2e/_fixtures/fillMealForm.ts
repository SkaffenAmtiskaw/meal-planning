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
	await form.getByLabel('Date').fill(date);
	await form.getByLabel('Meal name').fill(name);
	await form.getByLabel('Description').fill(description);
};
