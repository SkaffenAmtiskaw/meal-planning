import { Types } from 'mongoose';
import { describe, expect, test } from 'vitest';

import { daySchema, zDayInterface } from './day';

const recipeId = new Types.ObjectId().toString();

describe('day interface', () => {
	test('accepts a valid day with no meals', () => {
		expect(zDayInterface.safeParse({ date: '2026-03-27' }).success).toBe(true);
	});

	test('accepts a valid day with an empty meals array', () => {
		expect(
			zDayInterface.safeParse({ date: '2026-03-27', meals: [] }).success,
		).toBe(true);
	});

	test('accepts a day with a meal containing dishes', () => {
		expect(
			zDayInterface.safeParse({
				date: '2026-03-27',
				meals: [
					{
						name: "Hades' Power Lunch",
						dishes: [{ name: 'Flaming Ribs' }],
					},
				],
			}).success,
		).toBe(true);
	});

	test('accepts a day with a meal description', () => {
		expect(
			zDayInterface.safeParse({
				date: '2026-03-27',
				meals: [
					{
						name: "Hades' Power Lunch",
						description: 'High-energy underworld cuisine',
						dishes: [{ name: 'Flaming Ribs' }],
					},
				],
			}).success,
		).toBe(true);
	});

	test('accepts a dish with a plain string source', () => {
		expect(
			zDayInterface.safeParse({
				date: '2026-03-27',
				meals: [
					{
						name: "Hades' Power Lunch",
						dishes: [{ name: 'Flaming Ribs', source: 'Olympus Kitchen' }],
					},
				],
			}).success,
		).toBe(true);
	});

	test('accepts a dish with a URL source', () => {
		expect(
			zDayInterface.safeParse({
				date: '2026-03-27',
				meals: [
					{
						name: "Hades' Power Lunch",
						dishes: [
							{
								name: 'Flaming Ribs',
								source: { url: 'https://olympus.example.com' },
							},
						],
					},
				],
			}).success,
		).toBe(true);
	});

	test('accepts a dish with a ref source', () => {
		expect(
			zDayInterface.safeParse({
				date: '2026-03-27',
				meals: [
					{
						name: "Hades' Power Lunch",
						dishes: [
							{
								name: 'Flaming Ribs',
								source: { ref: 'Olympus Kitchen Cookbook' },
							},
						],
					},
				],
			}).success,
		).toBe(true);
	});

	test('accepts a dish with an ObjectId source referencing a saved recipe', () => {
		expect(
			zDayInterface.safeParse({
				date: '2026-03-27',
				meals: [
					{
						name: "Hades' Power Lunch",
						dishes: [{ name: 'Flaming Ribs', source: recipeId }],
					},
				],
			}).success,
		).toBe(true);
	});

	test('accepts a dish with a note', () => {
		expect(
			zDayInterface.safeParse({
				date: '2026-03-27',
				meals: [
					{
						name: "Hades' Power Lunch",
						dishes: [{ name: 'Flaming Ribs', note: 'Substituted lava sauce' }],
					},
				],
			}).success,
		).toBe(true);
	});

	test('rejects a day with an invalid date format', () => {
		expect(zDayInterface.safeParse({ date: '03/27/2026' }).success).toBe(false);
	});

	test('rejects a day missing date', () => {
		expect(zDayInterface.safeParse({}).success).toBe(false);
	});

	test('rejects a meal missing name', () => {
		expect(
			zDayInterface.safeParse({
				date: '2026-03-27',
				meals: [{ dishes: [{ name: 'Flaming Ribs' }] }],
			}).success,
		).toBe(false);
	});

	test('rejects a dish missing name', () => {
		expect(
			zDayInterface.safeParse({
				date: '2026-03-27',
				meals: [{ name: "Hades' Power Lunch", dishes: [{}] }],
			}).success,
		).toBe(false);
	});
});

describe('day schema', () => {
	// SchemaTypes.Union does not traverse nested validators via validateSync(), so
	// we access the validator function directly from the schema definition object.
	const dishSourceDef =
		// biome-ignore lint/suspicious/noExplicitAny: accessing internal Mongoose schema definition
		((daySchema.obj.meals as any)[0].dishes[0].source as any).of[1];
	const urlValidator: (v: unknown) => boolean = dishSourceDef.url.validate[0];

	test('dish source URL validator accepts a valid URL', () => {
		expect(urlValidator('https://olympus.example.com')).toBe(true);
	});

	test('dish source URL validator rejects an invalid URL', () => {
		expect(urlValidator('not-a-url')).toBe(false);
	});
});
