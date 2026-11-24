import { describe, expect, test } from 'vitest';

import { zAddMealInput } from './mealInput';

const savedId = '507f1f77bcf86cd799439012';

const withDish = (dish: object) => ({
	plannerId: '507f1f77bcf86cd799439011',
	date: '2026-11-27',
	mealName: 'Taco Night',
	dishes: [dish],
});

const parses = (dish: object) =>
	zAddMealInput.safeParse(withDish(dish)).success;

describe('zAddMealInput', () => {
	test('accepts a dish with no source', () => {
		expect(parses({ name: 'Rice' })).toBe(true);
	});

	test("accepts a dish linked to a saved item's id", () => {
		expect(parses({ name: 'Tacos', source: { kind: 'saved', savedId } })).toBe(
			true,
		);
	});

	test('rejects a saved source whose id is not an id', () => {
		expect(
			parses({ name: 'Tacos', source: { kind: 'saved', savedId: 'tacos' } }),
		).toBe(false);
	});

	test("accepts a dish with a reference's text", () => {
		expect(
			parses({ name: 'Salsa', source: { kind: 'reference', text: 'p. 12' } }),
		).toBe(true);
	});

	test('rejects a reference with no text', () => {
		expect(
			parses({ name: 'Salsa', source: { kind: 'reference', text: '' } }),
		).toBe(false);
	});

	test('rejects a source of another kind', () => {
		expect(parses({ name: 'Salsa', source: { kind: 'url', text: 'x' } })).toBe(
			false,
		);
	});

	test('rejects a dish with no name, saying the name is required', () => {
		const result = zAddMealInput.safeParse(withDish({ name: '' }));

		expect(result.error?.issues[0].message).toBe('Dish name is required');
	});

	test('rejects a meal with no name, saying the name is required', () => {
		const result = zAddMealInput.safeParse({
			...withDish({ name: 'Rice' }),
			mealName: '',
		});

		expect(result.error?.issues[0].message).toBe('Meal name is required');
	});
});
