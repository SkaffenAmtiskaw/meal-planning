import { describe, expect, test } from 'vitest';

import { model, Schema } from 'mongoose';

import { daySchema, zDayInterface } from './day';

import { newId } from '../database/newId';

const recipeId = newId();

const dish = (fields: object) => ({ _id: newId(), ...fields });
const meal = (fields: object) => ({ _id: newId(), ...fields });

describe('day interface', () => {
	test('rejects a day with no meals array', () => {
		expect(zDayInterface.safeParse({ date: '2026-03-27' }).success).toBe(false);
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
					meal({
						name: "Hades' Power Lunch",
						dishes: [dish({ name: 'Flaming Ribs' })],
					}),
				],
			}).success,
		).toBe(true);
	});

	test('accepts a day with a meal description', () => {
		expect(
			zDayInterface.safeParse({
				date: '2026-03-27',
				meals: [
					meal({
						name: "Hades' Power Lunch",
						description: 'High-energy underworld cuisine',
						dishes: [dish({ name: 'Flaming Ribs' })],
					}),
				],
			}).success,
		).toBe(true);
	});

	test('rejects a dish with a plain text source that is not an id', () => {
		expect(
			zDayInterface.safeParse({
				date: '2026-03-27',
				meals: [
					meal({
						name: "Hades' Power Lunch",
						dishes: [dish({ name: 'Flaming Ribs', source: 'Olympus Kitchen' })],
					}),
				],
			}).success,
		).toBe(false);
	});

	test('accepts a dish with a URL source', () => {
		expect(
			zDayInterface.safeParse({
				date: '2026-03-27',
				meals: [
					meal({
						name: "Hades' Power Lunch",
						dishes: [
							dish({
								name: 'Flaming Ribs',
								source: { url: 'https://olympus.example.com' },
							}),
						],
					}),
				],
			}).success,
		).toBe(true);
	});

	test('accepts a dish with a ref source', () => {
		expect(
			zDayInterface.safeParse({
				date: '2026-03-27',
				meals: [
					meal({
						name: "Hades' Power Lunch",
						dishes: [
							dish({
								name: 'Flaming Ribs',
								source: { ref: 'Olympus Kitchen Cookbook' },
							}),
						],
					}),
				],
			}).success,
		).toBe(true);
	});

	test('accepts a dish with an id source referencing a saved recipe', () => {
		expect(
			zDayInterface.safeParse({
				date: '2026-03-27',
				meals: [
					meal({
						name: "Hades' Power Lunch",
						dishes: [dish({ name: 'Flaming Ribs', source: recipeId })],
					}),
				],
			}).success,
		).toBe(true);
	});

	test('accepts a dish with a note', () => {
		expect(
			zDayInterface.safeParse({
				date: '2026-03-27',
				meals: [
					meal({
						name: "Hades' Power Lunch",
						dishes: [
							dish({ name: 'Flaming Ribs', note: 'Substituted lava sauce' }),
						],
					}),
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
				meals: [meal({ dishes: [dish({ name: 'Flaming Ribs' })] })],
			}).success,
		).toBe(false);
	});

	test('rejects a dish missing name', () => {
		expect(
			zDayInterface.safeParse({
				date: '2026-03-27',
				meals: [meal({ name: "Hades' Power Lunch", dishes: [dish({})] })],
			}).success,
		).toBe(false);
	});

	test('rejects a meal missing _id', () => {
		expect(
			zDayInterface.safeParse({
				date: '2026-03-27',
				meals: [
					{
						name: "Hades' Power Lunch",
						dishes: [dish({ name: 'Flaming Ribs' })],
					},
				],
			}).success,
		).toBe(false);
	});

	test('rejects a dish missing _id', () => {
		expect(
			zDayInterface.safeParse({
				date: '2026-03-27',
				meals: [
					meal({
						name: "Hades' Power Lunch",
						dishes: [{ name: 'Flaming Ribs' }],
					}),
				],
			}).success,
		).toBe(false);
	});
});

describe('day schema', () => {
	test('keeps the ids its creator gives meals and dishes, and stores none on the day', () => {
		const mealId = newId();
		const dishId = newId();
		const Parent = model(
			'DaySchemaTestParent',
			new Schema({ calendar: [daySchema] }),
		);
		const [day] = new Parent({
			calendar: [
				{
					date: '2026-03-27',
					meals: [
						{
							_id: mealId,
							name: "Hades' Power Lunch",
							dishes: [{ _id: dishId, name: 'Flaming Ribs' }],
						},
					],
				},
			],
		}).toObject().calendar;

		expect(day).not.toHaveProperty('_id');
		expect(day).toMatchObject({
			meals: [{ _id: mealId, dishes: [{ _id: dishId }] }],
		});
	});

	// SchemaTypes.Union does not traverse nested validators via validateSync(), so
	// we access the validator function directly from the schema definition object.
	const dishSourceDef =
		// biome-ignore lint/suspicious/noExplicitAny: accessing internal Mongoose schema definition
		((daySchema.obj.meals as any)[0].obj.dishes[0].obj.source as any).of[1];
	const urlValidator: (v: unknown) => boolean = dishSourceDef.url.validate[0];

	test('dish source URL validator accepts a valid URL', () => {
		expect(urlValidator('https://olympus.example.com')).toBe(true);
	});

	test('dish source URL validator rejects an invalid URL', () => {
		expect(urlValidator('not-a-url')).toBe(false);
	});
});
