import { describe, expect, it, vi } from 'vitest';

import { makeDishDraft, makeMealDraft } from '#fixtures/dish';

import { isBlankDish } from './isBlankDish';
import { toMealInput } from './toMealInput';

vi.mock(
	'./isBlankDish',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/MealForm/_utils/isBlankDish'
		),
);

describe('toMealInput', () => {
	it("sends the meal's fields and each dish's name, source and note", () => {
		const input = toMealInput(
			makeMealDraft({
				date: '2026-11-27',
				mealName: 'Taco Night',
				description: 'Fridays',
				dishes: [
					makeDishDraft({
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
			makeMealDraft({
				date: '2026-11-27',
				mealName: 'Taco Night',
				dishes: [makeDishDraft({ name: 'Salsa' })],
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
			makeMealDraft({
				date: '2026-11-27',
				mealName: 'Taco Night',
				description: '   ',
				dishes: [makeDishDraft({ name: 'Salsa', note: '  ' })],
			}),
		);

		expect(input).toEqual({
			date: '2026-11-27',
			mealName: 'Taco Night',
			dishes: [{ name: 'Salsa' }],
		});
	});

	it('drops blank dishes', () => {
		const blank = makeDishDraft({ key: 'blank' });
		vi.mocked(isBlankDish).mockImplementation((dish) => dish === blank);

		const input = toMealInput(
			makeMealDraft({
				date: '2026-11-27',
				mealName: 'Picnic',
				dishes: [blank, makeDishDraft({ key: 'b', name: 'Salsa' })],
			}),
		);

		expect(input.dishes).toEqual([{ name: 'Salsa' }]);
	});
});
