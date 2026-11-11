import { DateTime } from 'luxon';

import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

import { expect, signIn, test } from '../_fixtures';

const MEAL_NAME = "Persephone's Spring Risotto";

test('Today returns to the current month', async ({ context, page }) => {
	const now = DateTime.now();
	const planner = await createPlanner({
		calendar: [
			{
				date: now.toISODate(),
				meals: [{ name: MEAL_NAME, dishes: [] }],
			},
		],
	});
	const user = await createUser({
		planners: [{ planner: planner._id, accessLevel: 'write' }],
	});
	await signIn(context, user);
	await page.goto(`/${planner._id}/calendar`);

	const thisMonth = now.toFormat('MMMM yyyy', { locale: 'en-US' });
	const nextMonth = now
		.plus({ months: 1 })
		.toFormat('MMMM yyyy', { locale: 'en-US' });

	await page.getByRole('button', { name: 'Next' }).click();
	await expect(page.getByText(nextMonth, { exact: true })).toBeVisible();

	await page.getByRole('button', { name: 'Today' }).click();

	// The header's label is plain text on desktop and the date picker button's text on phone.
	await expect(page.getByText(thisMonth, { exact: true })).toBeVisible();
	await expect(page.getByText(MEAL_NAME)).toBeVisible();
});
