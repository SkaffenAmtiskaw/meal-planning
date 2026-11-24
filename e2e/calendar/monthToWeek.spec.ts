import { DateTime } from 'luxon';

import { expect, test } from '../_fixtures';
import { openPlannerCalendar } from '../_helpers/openPlannerCalendar';
import { weekCellName } from './_helpers/calendarLabels';
import { fillMealForm, saveMealForm } from './_helpers/mealForm';

const MEAL_NAME = "Rapunzel's Tower Supper";

test('a meal added in month view shows in week view', {
	tag: '@desktop-only',
}, async ({ context, page }) => {
	const now = DateTime.now();
	await openPlannerCalendar(page, context);

	await page.getByRole('button', { name: 'Add Meal' }).click();
	await fillMealForm(page, {
		date: now.toISODate(),
		name: MEAL_NAME,
		description: 'Eaten at the window',
	});
	const form = page.getByRole('dialog');
	await saveMealForm(page);

	// The modal closes as soon as the save works.
	await expect(form).toBeHidden();

	await page.getByText('Week', { exact: true }).click();

	const today = page.getByRole('gridcell', { name: weekCellName(now, 1) });
	await expect(today).toContainText(MEAL_NAME);
});
