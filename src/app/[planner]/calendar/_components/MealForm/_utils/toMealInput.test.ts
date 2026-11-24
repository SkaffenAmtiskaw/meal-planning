import { describe, expect, it } from 'vitest';

import { makeDishDraft, makeMealDraft } from '#fixtures/dish';

import { toMealInput } from './toMealInput';

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
});
