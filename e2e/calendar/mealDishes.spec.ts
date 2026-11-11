import { DateTime } from 'luxon';

import { newObjectId } from '#factories/objectId';

import {
	expect,
	fillMealForm,
	type Page,
	saveMealForm,
	test,
} from '../_fixtures';
import { monthCellName } from './_helpers/calendarLabels';
import { openPlannerCalendar } from './_helpers/openPlannerCalendar';

const MEAL_NAME = "Odysseus's Homecoming Feast";
const DISH_NAME = 'Ithacan Olive Bread';
const RECIPE_NAME = 'Penelope Patience Stew';
const SOURCE_URL = 'https://example.com/ithacan-olive-bread';

// Opens Add Meal, fills the meal's fields and names the form's first dish.
const startMealWithDish = async (page: Page, now: DateTime<true>) => {
	await page.getByRole('button', { name: 'Add Meal' }).click();
	await fillMealForm(page, {
		date: now.toISODate(),
		name: MEAL_NAME,
		description: 'Served on the return voyage',
	});
	const form = page.getByRole('dialog');
	await form.getByRole('textbox', { name: 'Dish name' }).fill(DISH_NAME);
	await form.getByRole('button', { name: 'Expand dish' }).click();

	return form;
};

// Saves the open form, then opens the saved meal's details from today in month view.
const saveAndOpenMeal = async (page: Page, now: DateTime<true>) => {
	await saveMealForm(page);

	const today = page.getByRole('gridcell', { name: monthCellName(now, 1) });
	await today.getByText(MEAL_NAME).click();

	return page.getByRole('dialog');
};

test('saves a dish with a URL source', { tag: '@desktop-only' }, async ({
	context,
	page,
}) => {
	const now = DateTime.now();
	await openPlannerCalendar(page, context);

	const form = await startMealWithDish(page, now);
	// The source switcher's radio inputs are hidden, so a user clicks, and the spec finds, each option's text.
	await form.getByText('Reference', { exact: true }).click();
	await form.getByPlaceholder('https://…').fill(SOURCE_URL);

	const details = await saveAndOpenMeal(page, now);
	await expect(details.getByRole('link', { name: DISH_NAME })).toHaveAttribute(
		'href',
		SOURCE_URL,
	);
});

test('saves a dish with a saved recipe source', {
	tag: '@desktop-only',
}, async ({ context, page }) => {
	const now = DateTime.now();
	const recipeId = newObjectId();
	const recipe = {
		_id: recipeId,
		name: RECIPE_NAME,
		ingredients: ['barley', 'lamb'],
		instructions: ['Simmer until the suitors leave'],
	};
	const planner = await openPlannerCalendar(page, context, {
		saved: [recipe],
	});

	const form = await startMealWithDish(page, now);
	await form.getByText('Saved', { exact: true }).click();
	await form.getByPlaceholder('Choose a saved item…').click();
	await page.getByRole('option', { name: RECIPE_NAME }).click();

	const details = await saveAndOpenMeal(page, now);
	await expect(details.getByRole('link', { name: DISH_NAME })).toHaveAttribute(
		'href',
		`/${planner._id}/recipes/${recipeId}`,
	);
});
