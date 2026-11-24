import { DateTime } from 'luxon';

import { expect, test } from '../_fixtures';
import { openPlannerRecipes } from '../recipes/_helpers/openPlannerRecipes';
import { fillRecipeForm, saveRecipeForm } from '../recipes/_helpers/recipeForm';
import { monthCellName } from './_helpers/calendarLabels';
import { fillMealForm, saveMealForm } from './_helpers/mealForm';

const RECIPE_NAME = "Tiana's Gumbo";
const MEAL_NAME = 'Bayou Supper';

test('adds a meal with a dish from the Saved recipes column', {
	tag: '@desktop-only',
}, async ({ context, page }) => {
	const now = DateTime.now();
	await openPlannerRecipes(page, context);

	await page.getByRole('button', { name: 'Add Item' }).click();
	await page.getByRole('menuitem', { name: 'Recipe' }).click();
	const recipeForm = page.getByRole('dialog');
	await fillRecipeForm(recipeForm, { name: RECIPE_NAME });
	await saveRecipeForm(recipeForm);
	const recipeLink = page.getByRole('link', { name: RECIPE_NAME });
	const recipeHref = await recipeLink.getAttribute('href');

	// The navbar link moves to Calendar without a reload, so the calendar must pick up the new recipe on its own.
	await page.getByTestId('burger-toggle').click();
	await page.getByRole('link', { name: 'Calendar' }).click();
	await page.getByRole('button', { name: 'Add Meal' }).click();
	await fillMealForm(page, {
		date: now.toISODate(),
		name: MEAL_NAME,
		description: 'Down on the bayou',
	});
	const mealForm = page.getByRole('dialog');
	await mealForm.getByRole('button', { name: `Add ${RECIPE_NAME}` }).click();
	// The form's first, blank row is dropped on save, leaving only the added dish.
	await saveMealForm(page);

	const today = page.getByRole('gridcell', { name: monthCellName(now, 1) });
	await today.getByText(MEAL_NAME).click();
	await expect(
		page.getByRole('dialog').getByRole('link', { name: RECIPE_NAME }),
	).toHaveAttribute('href', recipeHref ?? '');
});
