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

const FIRST_TAG = 'Wine-Dark';
const SECOND_TAG = 'Aegean';
const PHONE_RECIPE_NAME = "Penelope's Loom Bread";
const PHONE_OTHER_RECIPE_NAME = "Nausicaa's Picnic";
const PHONE_MEAL_NAME = 'Ithaca Homecoming';

test("adds a meal with a saved recipe narrowed by two tags in a dish's list", {
	tag: '@phone-only',
}, async ({ context, page }) => {
	const firstTagId = newId();
	const secondTagId = newId();
	const recipeId = newId();
	const planner = await openPlannerCalendar(page, context, {
		tags: [
			{ _id: firstTagId, name: FIRST_TAG, color: 'seafoam' },
			{ _id: secondTagId, name: SECOND_TAG, color: 'fern' },
		],
		saved: [
			{
				_id: recipeId,
				name: PHONE_RECIPE_NAME,
				ingredients: ['flour'],
				instructions: ['Unweave each night'],
				tags: [firstTagId, secondTagId],
			},
			{
				_id: newId(),
				name: PHONE_OTHER_RECIPE_NAME,
				ingredients: ['olives'],
				instructions: ['Pack by the river'],
				tags: [secondTagId],
			},
		],
	});

	await page.getByRole('button', { name: 'Add Meal' }).click();
	await fillMealForm(page, {
		date: DateTime.now().toISODate(),
		name: PHONE_MEAL_NAME,
		description: 'Twenty years away',
	});
	const form = page.getByRole('dialog');
	await form.getByRole('textbox', { name: 'Dish name' }).click();
	const tags = form.getByRole('group', { name: 'Filter by tag' });
	// Picked against alphabetical order, so the title shows pick order.
	await tags.getByText(FIRST_TAG).click();
	await tags.getByText(SECOND_TAG).click();
	await expect(
		form.getByText(`Saved · ${FIRST_TAG} + ${SECOND_TAG}`),
	).toBeVisible();
	await expect(
		form.getByRole('button', { name: `Use ${PHONE_OTHER_RECIPE_NAME}` }),
	).toBeHidden();
	await form.getByRole('button', { name: `Use ${PHONE_RECIPE_NAME}` }).click();
	await saveMealForm(page);

	// Today's agenda card shows the saved meal's dishes. It has no role or name to find it by.
	const card = page
		.getByTestId('meal-card')
		.filter({ hasText: PHONE_MEAL_NAME });
	await expect(
		card.getByRole('link', { name: PHONE_RECIPE_NAME }),
	).toHaveAttribute('href', recipePath(planner._id, recipeId));
});
