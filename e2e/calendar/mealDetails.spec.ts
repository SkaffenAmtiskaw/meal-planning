import { DateTime } from 'luxon';

import { newObjectId } from '#factories/objectId';

import {
	type BrowserContext,
	expect,
	type Locator,
	type Page,
	test,
} from '../_fixtures';
import { monthCellName } from './_helpers/calendarLabels';
import { openPlannerCalendar } from './_helpers/openPlannerCalendar';

const MEAL_NAME = "Persephone's Spring Supper";
const DESCRIPTION = 'Six seeds, and not one more';
const URL_DISH = 'Asphodel Greens';
const SOURCE_URL = 'https://example.com/asphodel-greens';
const RECIPE_DISH = 'Demeter Harvest Loaf';

// Seeds a planner with a meal on the date holding a URL dish and a saved recipe dish, and opens its calendar.
const openCalendarWithMeal = async (
	page: Page,
	context: BrowserContext,
	date: DateTime<true>,
) => {
	const recipeId = newObjectId();
	const planner = await openPlannerCalendar(page, context, {
		saved: [
			{
				_id: recipeId,
				name: RECIPE_DISH,
				ingredients: ['wheat', 'honey'],
				instructions: ['Bake until the fields turn gold'],
			},
		],
		calendar: [
			{
				date: date.toISODate(),
				meals: [
					{
						name: MEAL_NAME,
						description: DESCRIPTION,
						dishes: [
							{ name: URL_DISH, source: { url: SOURCE_URL } },
							{ name: RECIPE_DISH, source: recipeId },
						],
					},
				],
			},
		],
	});

	return `/${planner._id}/recipes/${recipeId}`;
};

// Checks a meal's description and that each of its dishes links where it should.
const expectMealDetails = async (details: Locator, recipeHref: string) => {
	await expect(details.getByText(DESCRIPTION)).toBeVisible();
	await expect(details.getByRole('link', { name: URL_DISH })).toHaveAttribute(
		'href',
		SOURCE_URL,
	);
	await expect(
		details.getByRole('link', { name: RECIPE_DISH }),
	).toHaveAttribute('href', recipeHref);
};

test('meal details show the meal and link its dishes on desktop', {
	tag: '@desktop-only',
}, async ({ context, page }) => {
	const now = DateTime.now();
	const recipeHref = await openCalendarWithMeal(page, context, now);

	await page
		.getByRole('gridcell', { name: monthCellName(now, 1) })
		.getByText(MEAL_NAME)
		.click();

	const details = page.getByRole('dialog');
	await expect(details.getByText(MEAL_NAME)).toBeVisible();
	await expectMealDetails(details, recipeHref);
});

test('meal details show the meal and link its dishes on phone', {
	tag: '@phone-only',
}, async ({ context, page }) => {
	const now = DateTime.now();
	// A day this month other than today, so the agenda only shows the meal after the tap.
	const mealDay =
		now.day === 1 ? now.plus({ days: 1 }) : now.minus({ days: 1 });
	const recipeHref = await openCalendarWithMeal(page, context, mealDay);

	await page.getByRole('button', { name: monthCellName(mealDay, 1) }).click();

	await expect(
		page.getByText(mealDay.toFormat('EEEE, MMMM d', { locale: 'en-US' }), {
			exact: true,
		}),
	).toBeVisible();
	// The agenda card has no role or name to find it by.
	const card = page.getByTestId('meal-card').filter({ hasText: MEAL_NAME });
	await expectMealDetails(card, recipeHref);
});
