import { describe, expect, it, vi } from 'vitest';

import { makeDishValues, makeMealValues } from '#fixtures/dish';

import { toMealInput } from './toMealInput';

import { isBlankDish } from '../../_utils/isBlankDish';

vi.mock(
	'../../_utils/isBlankDish',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/_utils/isBlankDish'
		),
);

describe('toMealInput', () => {
	it("sends the meal's fields and each dish's name, source and note", () => {
		const input = toMealInput(
			makeMealValues({
				date: '2026-11-27',
				mealName: 'Taco Night',
				description: 'Fridays',
				dishes: [
					makeDishValues({
						name: 'Tacos',
						source: { kind: 'saved', savedId: 'saved-1' },
						note: 'Warm the shells',
					}),
				],
			}),
		);

		expect(input).toEqual({
			date: '2026-11-27',
			mealName: 'Taco Night',
			description: 'Fridays',
			dishes: [
				{
					name: 'Tacos',
					source: { kind: 'saved', savedId: 'saved-1' },
					note: 'Warm the shells',
				},
			],
		});
	});

	it('leaves out an empty description, an unlinked source and an empty note', () => {
		const input = toMealInput(
			makeMealValues({
				date: '2026-11-27',
				mealName: 'Taco Night',
				dishes: [makeDishValues({ name: 'Salsa' })],
			}),
		);

		expect(input).toEqual({
			date: '2026-11-27',
			mealName: 'Taco Night',
			dishes: [{ name: 'Salsa' }],
		});
	});

	it('leaves out a description or note of only spaces', () => {
		const input = toMealInput(
			makeMealValues({
				date: '2026-11-27',
				mealName: 'Taco Night',
				description: '   ',
				dishes: [makeDishValues({ name: 'Salsa', note: '  ' })],
			}),
		);

		expect(input).toEqual({
			date: '2026-11-27',
			mealName: 'Taco Night',
			dishes: [{ name: 'Salsa' }],
		});
	});

	it('drops blank dishes', () => {
		const blank = makeDishValues({ key: 'blank' });
		vi.mocked(isBlankDish).mockImplementation((dish) => dish === blank);

		const input = toMealInput(
			makeMealValues({
				date: '2026-11-27',
				mealName: 'Picnic',
				dishes: [blank, makeDishValues({ key: 'b', name: 'Salsa' })],
			}),
		);

		expect(input.dishes).toEqual([{ name: 'Salsa' }]);
	});
});
