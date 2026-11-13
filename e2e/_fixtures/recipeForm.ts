import type { Locator, Page } from '@playwright/test';

// The Recipe form's fields, shaped like a saved recipe, so a spec can pass seeded values.
type RecipeFormFields = {
	name?: string;
	source?: { name?: string; url?: string };
	time?: { prep?: string; cook?: string; total?: string; actual?: string };
	servings?: number;
	ingredients?: string[];
	instructions?: string[];
	notes?: string;
	storage?: string;
};

// Fills each given field of the Recipe form within the scope: the dialog on the Recipes page, or the page on a recipe's page. Ingredients and instructions are added as new rows.
export const fillRecipeForm = async (
	scope: Page | Locator,
	{
		name,
		source,
		time,
		servings,
		ingredients = [],
		instructions = [],
		notes,
		storage,
	}: RecipeFormFields,
) => {
	const textbox = (within: Page | Locator, label: string) =>
		within.getByRole('textbox', { name: label, exact: true });

	if (name !== undefined) await textbox(scope, 'Title').fill(name);

	// Scoped to the Source group, since its fields are labelled only "Name" and "URL".
	const sourceGroup = scope.getByRole('group', { name: 'Source' });
	if (source?.name !== undefined)
		await textbox(sourceGroup, 'Name').fill(source.name);
	if (source?.url !== undefined)
		await textbox(sourceGroup, 'URL').fill(source.url);

	if (time?.prep !== undefined) await textbox(scope, 'Prep').fill(time.prep);
	if (time?.cook !== undefined) await textbox(scope, 'Cook').fill(time.cook);
	if (time?.total !== undefined) await textbox(scope, 'Total').fill(time.total);
	if (time?.actual !== undefined)
		await textbox(scope, 'Actual').fill(time.actual);
	if (servings !== undefined)
		await textbox(scope, 'Servings').fill(String(servings));

	// Both lists' buttons are named "Add", and the form shows Ingredients first, then Instructions.
	const addButtons = scope.getByRole('button', { name: 'Add', exact: true });
	const lists = [
		{
			add: addButtons.first(),
			placeholder: 'e.g. 1 cup flour',
			rows: ingredients,
		},
		{
			add: addButtons.nth(1),
			placeholder: 'e.g. Preheat oven to 350°F',
			rows: instructions,
		},
	];
	for (const { add, placeholder, rows } of lists) {
		for (const row of rows) {
			await add.click();
			await scope
				.getByPlaceholder(placeholder, { exact: true })
				.last()
				.fill(row);
		}
	}

	if (notes !== undefined) await textbox(scope, 'Notes').fill(notes);
	if (storage !== undefined) await textbox(scope, 'Storage').fill(storage);
};

// Submits the Recipe form within the scope, whether it's adding a recipe or saving one.
export const saveRecipeForm = async (scope: Page | Locator) => {
	await scope.getByRole('button', { name: /^(Add Recipe|Save)$/ }).click();
};
