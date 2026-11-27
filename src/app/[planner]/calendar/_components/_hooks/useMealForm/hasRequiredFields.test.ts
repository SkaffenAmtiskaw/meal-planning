import { describe, expect, it } from 'vitest';

import { makeMealValues } from '#fixtures/dish';

import { hasRequiredFields } from './hasRequiredFields';

describe('hasRequiredFields', () => {
	it('is true once Date and Meal name are filled', () => {
		expect(
			hasRequiredFields(
				makeMealValues({ date: '2026-11-26', mealName: 'Dinner' }),
			),
		).toBe(true);
	});

	it.each([
		{ date: '', mealName: 'Dinner' },
		{ date: '2026-11-26', mealName: '' },
		{ date: '2026-11-26', mealName: '   ' },
	])('is false while Date or Meal name is empty ($date, $mealName)', ({
		date,
		mealName,
	}) => {
		expect(hasRequiredFields(makeMealValues({ date, mealName }))).toBe(false);
	});
});
