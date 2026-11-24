import { describe, expect, it } from 'vitest';

import { makeMealDraft } from '#fixtures/dish';

import { canSubmitMeal } from './canSubmitMeal';

describe('canSubmitMeal', () => {
	it('allows a save once Date and Meal name are filled', () => {
		expect(
			canSubmitMeal(makeMealDraft({ date: '2026-11-27', mealName: 'Supper' })),
		).toBe(true);
	});

	it.each([
		{ missing: 'Date', date: '', mealName: 'Supper' },
		{ missing: 'Meal name', date: '2026-11-27', mealName: '' },
		{
			missing: 'Meal name, which is only spaces',
			date: '2026-11-27',
			mealName: '  ',
		},
	])('blocks a save without $missing', ({ date, mealName }) => {
		expect(canSubmitMeal(makeMealDraft({ date, mealName }))).toBe(false);
	});
});
