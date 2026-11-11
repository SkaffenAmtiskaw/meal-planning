import { DateTime } from 'luxon';

import { expect, fillMealForm, test } from '../_fixtures';
import { openPlannerCalendar } from './_helpers/openPlannerCalendar';

const MEAL_NAME = "Persephone's Spring Risotto";
const DESCRIPTION = 'Studded with six pomegranate seeds';

test('adds a meal from the phone add button', { tag: '@phone-only' }, async ({
	context,
	page,
}) => {
	// Expected to fail until "Blank Dish Row Blocks Saving a Meal" is fixed: the form's blank starting dish row makes the save throw.
	test.fail();

	await openPlannerCalendar(page, context);

	await page.getByRole('button', { name: 'Add Meal' }).click();
	await fillMealForm(page, {
		date: DateTime.now().toISODate(),
		name: MEAL_NAME,
		description: DESCRIPTION,
	});
	await page
		.getByRole('dialog')
		.getByRole('button', { name: 'Add Meal' })
		.click();

	// The agenda card has no role or name to find it by.
	await expect(
		page.getByTestId('meal-card').filter({ hasText: MEAL_NAME }),
	).toBeVisible();
});
