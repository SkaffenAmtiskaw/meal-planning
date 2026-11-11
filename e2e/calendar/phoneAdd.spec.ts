import { DateTime } from 'luxon';

import { expect, fillMealForm, saveMealForm, test } from '../_fixtures';
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
	await saveMealForm(page);

	// The phone grid marks a day's meals with dots, so the meal's name shows on its own only in the agenda. It's exact because the form's subtitle, "<day> · <meal name>", holds it too.
	await expect(page.getByText(MEAL_NAME, { exact: true })).toBeVisible();
});
