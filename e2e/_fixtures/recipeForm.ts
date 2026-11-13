import type { Locator, Page } from '@playwright/test';

type RecipeFormFields = {
	name?: string;
	servings?: number;
	// Added as new rows after any the form already shows.
	addIngredients?: string[];
};

// Fills each given field of the Recipe form within the scope: the dialog on the Recipes page, or the page on a recipe's page.
export const fillRecipeForm = async (
	scope: Page | Locator,
	{ name, servings, addIngredients = [] }: RecipeFormFields,
) => {
	const textbox = (label: string) =>
		scope.getByRole('textbox', { name: label, exact: true });

	if (name !== undefined) await textbox('Title').fill(name);
	if (servings !== undefined) await textbox('Servings').fill(String(servings));

	// Ingredients' and Instructions' buttons are both named "Add", and the form shows Ingredients first.
	const addIngredient = scope
		.getByRole('button', { name: 'Add', exact: true })
		.first();
	for (const ingredient of addIngredients) {
		await addIngredient.click();
		await scope
			.getByPlaceholder('e.g. 1 cup flour', { exact: true })
			.last()
			.fill(ingredient);
	}
};

// Submits the Recipe form within the scope, whether it's adding a recipe or saving one.
export const saveRecipeForm = async (scope: Page | Locator) => {
	await scope.getByRole('button', { name: /^(Add Recipe|Save)$/ }).click();
};
