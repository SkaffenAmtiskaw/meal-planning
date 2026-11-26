import { DateTime } from 'luxon';

import { newId } from '#factories/id';

import { expect, test } from '../_fixtures';
import { openPlannerCalendar } from '../_helpers/openPlannerCalendar';
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

const EARLIER_RECIPE_NAME = "Dorothy's Apple Tart";
const LATER_RECIPE_NAME = "Tin Man's Oil Cake";
const USED_MEAL_NAME = 'Emerald City Tea';

test('puts a saved recipe a saved meal links first the next time Add Meal opens', {
	tag: '@desktop-only',
}, async ({ context, page }) => {
	await openPlannerCalendar(page, context, {
		saved: [
			{
				_id: newId(),
				name: EARLIER_RECIPE_NAME,
				ingredients: ['apples'],
				instructions: ['Bake in Kansas'],
			},
			{
				_id: newId(),
				name: LATER_RECIPE_NAME,
				ingredients: ['flour'],
				instructions: ['Oil the tin and bake'],
			},
		],
	});
	const form = page.getByRole('dialog');
	const savedRows = form.getByRole('button', {
		name: new RegExp(`^Add (${EARLIER_RECIPE_NAME}|${LATER_RECIPE_NAME})$`),
	});

	await page.getByRole('button', { name: 'Add Meal' }).click();
	await expect(savedRows.first()).toHaveAccessibleName(
		`Add ${EARLIER_RECIPE_NAME}`,
	);
	await fillMealForm(page, {
		date: DateTime.now().toISODate(),
		name: USED_MEAL_NAME,
		description: 'Over the rainbow',
	});
	await form.getByRole('button', { name: `Add ${LATER_RECIPE_NAME}` }).click();
	await saveMealForm(page);
	await expect(form).toBeHidden();

	await page.getByRole('button', { name: 'Add Meal' }).click();
	await expect(savedRows.first()).toHaveAccessibleName(
		`Add ${LATER_RECIPE_NAME}`,
	);
});
