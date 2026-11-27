import { DateTime } from 'luxon';

import { expect, test } from '../_fixtures';
import { openPlannerCalendar } from '../_helpers/openPlannerCalendar';
import { mealOn } from './_helpers/mealOn';

const SEEDED_MEAL = "Demeter's Harvest Bread";
const NEW_MEAL = "Iris' Rainbow Salad";

test("adds a meal from a day's add button in the phone list", {
	tag: '@phone-only',
}, async ({ context, page }) => {
	const day = DateTime.now().plus({ weeks: 1 });
	await openPlannerCalendar(page, context, {
		calendar: mealOn(day, SEEDED_MEAL),
	});
	// The switcher's radio inputs are hidden, so a user clicks, and the spec finds, each option's text.
	await page.getByText('List', { exact: true }).click();

	// Each day's section is labelled with its full date, like "Friday, December 4".
	const fullDate = day.toFormat('EEEE, MMMM d', { locale: 'en-US' });
	const section = page.getByRole('region', { name: fullDate });
	await expect(section).toContainText(SEEDED_MEAL);

	await section
		.getByRole('button', { name: `Add meal for ${fullDate}` })
		.click();
	// The form opens on the day, so the spec leaves the Date field as it is.
	const form = page.getByRole('dialog', { name: 'Add Meal' });
	await form.getByRole('textbox', { name: 'Meal name' }).fill(NEW_MEAL);
	await form.getByRole('button', { name: 'Add Meal' }).click();

	await expect(section).toContainText(NEW_MEAL);
	await expect(
		page.getByText(
			`Added to ${day.toFormat('ccc, MMM d', { locale: 'en-US' })}`,
		),
	).toBeVisible();
});
