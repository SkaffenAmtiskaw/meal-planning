import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeDishValues, makeMealValues } from '#fixtures/dish';

import { isNamelessDish, zMealValues, zRequiredMealFields } from './mealValues';

import { isBlankDish } from '../../_utils/isBlankDish';

vi.mock(
	'../../_utils/isBlankDish',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/_utils/isBlankDish'
		),
);

describe('isNamelessDish', () => {
	beforeEach(() => {
		vi.mocked(isBlankDish).mockReturnValue(false);
	});

	it.each([
		'',
		'  ',
	])('is nameless with something in it but no name (%j)', (name) => {
		expect(isNamelessDish(makeDishValues({ name, note: 'Buy rolls' }))).toBe(
			true,
		);
	});

	it('is not nameless with a name', () => {
		expect(isNamelessDish(makeDishValues({ name: 'Soup' }))).toBe(false);
	});

	it('is not nameless while blank, as a save drops a blank row', () => {
		vi.mocked(isBlankDish).mockReturnValue(true);

		expect(isNamelessDish(makeDishValues())).toBe(false);
	});
});

describe('zRequiredMealFields', () => {
	it('passes with a date and a meal name', () => {
		expect(
			zRequiredMealFields.safeParse({ date: '2026-11-26', mealName: 'Dinner' })
				.success,
		).toBe(true);
	});

	it.each([
		{ missing: 'the date', date: '', mealName: 'Dinner' },
		{ missing: 'the meal name', date: '2026-11-26', mealName: '' },
		{
			missing: 'a meal name of only spaces',
			date: '2026-11-26',
			mealName: '  ',
		},
	])('fails without $missing', ({ date, mealName }) => {
		expect(zRequiredMealFields.safeParse({ date, mealName }).success).toBe(
			false,
		);
	});
});

describe('zMealValues', () => {
	beforeEach(() => {
		vi.mocked(isBlankDish).mockReturnValue(false);
	});

	const meal = (names: string[]) =>
		makeMealValues({
			date: '2026-11-26',
			mealName: 'Dinner',
			dishes: names.map((name, index) =>
				makeDishValues({ key: `dish-${index}`, name, note: 'x' }),
			),
		});

	it('passes a meal whose dishes all have names', () => {
		expect(zMealValues.safeParse(meal(['Curry', 'Rice'])).success).toBe(true);
	});

	it("puts each nameless dish's error on its own name", () => {
		const result = zMealValues.safeParse(meal(['Curry', '', 'Rice', ' ']));

		expect(
			result.error?.issues.map(({ path, message }) => ({ path, message })),
		).toEqual([
			{ path: ['dishes', 1, 'name'], message: 'Name this dish, or delete it.' },
			{ path: ['dishes', 3, 'name'], message: 'Name this dish, or delete it.' },
		]);
	});
});
