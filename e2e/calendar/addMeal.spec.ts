import { DateTime } from 'luxon';

import { expect, fillMealForm, test } from '../_fixtures';
import { openPlannerCalendar } from './_helpers/openPlannerCalendar';

const MEAL_NAME = "Ariadne's Labyrinth Lasagna";
const DESCRIPTION = 'Layered with a thread of basil';

test('adds a meal from the Add Meal form', { tag: '@desktop-only' }, async ({
	context,
	page,
}) => {
	// Expected to fail until "Blank Dish Row Blocks Saving a Meal" is fixed: the form's blank starting dish row makes the save throw.
	test.fail();

	const now = DateTime.now();
	await openPlannerCalendar(page, context);

	await page.getByRole('button', { name: 'Add Meal' }).click();
	await fillMealForm(page, {
		date: now.toISODate(),
		name: MEAL_NAME,
		description: DESCRIPTION,
	});
	await page
		.getByRole('dialog')
		.getByRole('button', { name: 'Add Meal' })
		.click();

	const today = page.getByRole('gridcell', {
		name: `${now.toFormat('MMMM d', { locale: 'en-US' })}, 1 meals`,
	});
	await expect(today).toContainText(MEAL_NAME);

	await today.getByText(MEAL_NAME).click();

	await expect(page.getByRole('dialog')).toContainText(DESCRIPTION);
});
