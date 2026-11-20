import { expect, test } from '../_fixtures';
import { openPlannerRecipes } from '../recipes/_helpers/openPlannerRecipes';
import { fillRecipeForm, saveRecipeForm } from '../recipes/_helpers/recipeForm';

const RECIPE_NAME = "Tiana's Gumbo";
const DISH_NAME = 'Bayou Gumbo';

test('a recipe added on the Recipes page is a saved choice in Add Meal', {
	tag: '@desktop-only',
}, async ({ context, page }) => {
	await openPlannerRecipes(page, context);

	await page.getByRole('button', { name: 'Add Item' }).click();
	await page.getByRole('menuitem', { name: 'Recipe' }).click();
	const recipeForm = page.getByRole('dialog');
	await fillRecipeForm(recipeForm, { name: RECIPE_NAME });
	await saveRecipeForm(recipeForm);
	await expect(page.getByRole('link', { name: RECIPE_NAME })).toBeVisible();

	// The navbar link moves to Calendar without a reload, so the planner's browser-fetched copy isn't fetched again.
	await page.getByTestId('burger-toggle').click();
	await page.getByRole('link', { name: 'Calendar' }).click();
	await page.getByRole('button', { name: 'Add Meal' }).click();
	const mealForm = page.getByRole('dialog');
	await mealForm.getByRole('textbox', { name: 'Dish name' }).fill(DISH_NAME);
	await mealForm.getByRole('button', { name: 'Expand dish' }).click();
	// The source switcher's radio inputs are hidden, so a user clicks, and the spec finds, each option's text.
	await mealForm.getByText('Saved', { exact: true }).click();
	await mealForm.getByPlaceholder('Choose a saved item…').click();

	await expect(page.getByRole('option', { name: RECIPE_NAME })).toBeVisible();
});
