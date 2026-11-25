import { DateTime } from 'luxon';

import { newId } from '#factories/id';

import { expect, test } from '../_fixtures';
import { openPlannerCalendar } from '../_helpers/openPlannerCalendar';
import { recipePath } from '../_helpers/plannerPaths';
import { monthCellName } from './_helpers/calendarLabels';
import { fillMealForm, saveMealForm } from './_helpers/mealForm';

const TAG_NAME = 'Seafaring';
const RECIPE_NAME = "Nemo's Kelp Soup";
const OTHER_RECIPE_NAME = "Phileas Fogg's Toast";
const MEAL_NAME = 'Nautilus Supper';

test('adds a meal with a saved recipe narrowed by a tag', {
	tag: '@desktop-only',
}, async ({ context, page }) => {
	const now = DateTime.now();
	const tagId = newId();
	const recipeId = newId();
	const planner = await openPlannerCalendar(page, context, {
		tags: [{ _id: tagId, name: TAG_NAME, color: 'seafoam' }],
		saved: [
			{
				_id: recipeId,
				name: RECIPE_NAME,
				ingredients: ['kelp'],
				instructions: ['Simmer under the sea'],
				tags: [tagId],
			},
			{
				_id: newId(),
				name: OTHER_RECIPE_NAME,
				ingredients: ['bread'],
				instructions: ['Toast in eighty seconds'],
			},
		],
	});

	await page.getByRole('button', { name: 'Add Meal' }).click();
	await fillMealForm(page, {
		date: now.toISODate(),
		name: MEAL_NAME,
		description: 'Twenty thousand leagues down',
	});
	const form = page.getByRole('dialog');
	await form
		.getByRole('group', { name: 'Filter by tag' })
		.getByText(TAG_NAME)
		.click();
	await expect(
		form.getByRole('button', { name: `Add ${OTHER_RECIPE_NAME}` }),
	).toBeHidden();
	await form.getByRole('button', { name: `Add ${RECIPE_NAME}` }).click();
	// The form's first, blank row is dropped on save, leaving only the added dish.
	await saveMealForm(page);

	const today = page.getByRole('gridcell', { name: monthCellName(now, 1) });
	await today.getByText(MEAL_NAME).click();
	await expect(
		page.getByRole('dialog').getByRole('link', { name: RECIPE_NAME }),
	).toHaveAttribute('href', recipePath(planner._id, recipeId));
});
