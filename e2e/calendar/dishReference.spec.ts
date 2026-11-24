import { DateTime } from 'luxon';

import { expect, test } from '../_fixtures';
import { openPlannerCalendar } from '../_helpers/openPlannerCalendar';
import { monthCellName } from './_helpers/calendarLabels';
import { fillMealForm, saveMealForm } from './_helpers/mealForm';

const MEAL_NAME = "Odysseus's Homecoming Feast";
const DISH_NAME = 'Ithacan Olive Bread';
const REFERENCE_URL = 'https://example.com/ithacan-olive-bread';

test('saves a dish with a URL reference', { tag: '@desktop-only' }, async ({
	context,
	page,
}) => {
	const now = DateTime.now();
	await openPlannerCalendar(page, context);

	await page.getByRole('button', { name: 'Add Meal' }).click();
	await fillMealForm(page, {
		date: now.toISODate(),
		name: MEAL_NAME,
		description: 'Served on the return voyage',
	});
	const form = page.getByRole('dialog');
	await form.getByRole('textbox', { name: 'Dish name' }).fill(DISH_NAME);
	await form.getByRole('button', { name: 'Expand dish' }).click();
	await form.getByRole('textbox', { name: 'Reference' }).fill(REFERENCE_URL);
	await saveMealForm(page);

	const today = page.getByRole('gridcell', { name: monthCellName(now, 1) });
	await today.getByText(MEAL_NAME).click();
	await expect(
		page.getByRole('dialog').getByRole('link', { name: DISH_NAME }),
	).toHaveAttribute('href', REFERENCE_URL);
});
