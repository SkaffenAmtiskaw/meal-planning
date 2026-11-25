import { DateTime } from 'luxon';

import { newId } from '#factories/id';

import { expect, test } from '../_fixtures';
import { openPlannerCalendar } from '../_helpers/openPlannerCalendar';
import { recipePath } from '../_helpers/plannerPaths';
import { fillMealForm, saveMealForm } from './_helpers/mealForm';

const RECIPE_NAME = "Calypso's Island Stew";
const MEAL_NAME = 'Ogygia Supper';

test('adds a meal with a saved recipe found by typing a dish name', {
	tag: '@phone-only',
}, async ({ context, page }) => {
	const recipeId = newId();
	const planner = await openPlannerCalendar(page, context, {
		saved: [
			{
				_id: recipeId,
				name: RECIPE_NAME,
				ingredients: ['fish', 'thyme'],
				instructions: ['Simmer for seven years'],
			},
		],
	});

	await page.getByRole('button', { name: 'Add Meal' }).click();
	await fillMealForm(page, {
		date: DateTime.now().toISODate(),
		name: MEAL_NAME,
		description: 'Far from Ithaca',
	});
	const form = page.getByRole('dialog');
	await form.getByRole('textbox', { name: 'Dish name' }).fill('island');
	await form.getByRole('button', { name: `Use ${RECIPE_NAME}` }).click();
	await saveMealForm(page);

	// Today's agenda card shows the saved meal's dishes. It has no role or name to find it by.
	const card = page.getByTestId('meal-card').filter({ hasText: MEAL_NAME });
	await expect(card.getByRole('link', { name: RECIPE_NAME })).toHaveAttribute(
		'href',
		recipePath(planner._id, recipeId),
	);
});
