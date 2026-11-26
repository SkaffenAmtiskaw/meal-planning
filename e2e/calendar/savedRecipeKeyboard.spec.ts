import { DateTime } from 'luxon';

import { newId } from '#factories/id';

import { expect, test } from '../_fixtures';
import { openPlannerCalendar } from '../_helpers/openPlannerCalendar';
import { recipePath } from '../_helpers/plannerPaths';
import { monthCellName } from './_helpers/calendarLabels';
import { fillMealForm, saveMealForm } from './_helpers/mealForm';

const FIRST_RECIPE_NAME = "Captain Hook's Cove Chowder";
const SECOND_RECIPE_NAME = "Wendy's Cove Pie";
const OTHER_RECIPE_NAME = "Tinker Bell's Dew Tart";
const MEAL_NAME = 'Neverland Supper';

test('adds a meal with a dish picked from the Saved recipes column with the keyboard', {
	tag: '@desktop-only',
}, async ({ context, page }) => {
	const now = DateTime.now();
	const recipeId = newId();
	const planner = await openPlannerCalendar(page, context, {
		saved: [
			{
				_id: newId(),
				name: FIRST_RECIPE_NAME,
				ingredients: ['clams'],
				instructions: ['Simmer by the lagoon'],
			},
			{
				_id: recipeId,
				name: SECOND_RECIPE_NAME,
				ingredients: ['pastry'],
				instructions: ['Bake at second star to the right'],
			},
			{
				_id: newId(),
				name: OTHER_RECIPE_NAME,
				ingredients: ['dew'],
				instructions: ['Gather at dawn'],
			},
		],
	});

	await page.getByRole('button', { name: 'Add Meal' }).click();
	await fillMealForm(page, {
		date: now.toISODate(),
		name: MEAL_NAME,
		description: 'Off to never land',
	});
	const form = page.getByRole('dialog');
	const search = form.getByRole('textbox', { name: 'Search saved recipes' });
	await search.fill('cove');
	await search.press('Escape');

	// Esc emptied the search rather than closing the modal and losing the meal.
	await expect(search).toHaveValue('');
	await expect(form.getByRole('textbox', { name: 'Meal name' })).toHaveValue(
		MEAL_NAME,
	);
	await search.fill('cove');
	await search.press('ArrowDown');
	await search.press('Enter');

	// Enter added the dish rather than submitting the form, so the modal is still open.
	await expect(
		form.getByRole('button', { name: `${SECOND_RECIPE_NAME}, added` }),
	).toBeVisible();
	await saveMealForm(page);

	const today = page.getByRole('gridcell', { name: monthCellName(now, 1) });
	await today.getByText(MEAL_NAME).click();
	await expect(
		page.getByRole('dialog').getByRole('link', { name: SECOND_RECIPE_NAME }),
	).toHaveAttribute('href', recipePath(planner._id, recipeId));
});
