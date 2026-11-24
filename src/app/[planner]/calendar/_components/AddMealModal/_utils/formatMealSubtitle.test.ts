import { describe, expect, it } from 'vitest';

import { formatMealSubtitle } from './formatMealSubtitle';

describe('formatMealSubtitle', () => {
	it.each([
		{
			filled: 'both',
			date: '2026-11-27',
			mealName: 'Taco Night',
			subtitle: 'Friday, November 27 · Taco Night',
		},
		{
			filled: 'only the date',
			date: '2026-11-27',
			mealName: '',
			subtitle: 'Friday, November 27',
		},
		{
			filled: 'only the meal name',
			date: '',
			mealName: 'Taco Night',
			subtitle: 'Taco Night',
		},
		{ filled: 'neither', date: '', mealName: '', subtitle: '' },
	])('reads "$subtitle" with $filled filled in', ({
		date,
		mealName,
		subtitle,
	}) => {
		expect(formatMealSubtitle({ date, mealName })).toBe(subtitle);
	});
});
