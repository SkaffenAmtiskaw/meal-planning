import { Types } from 'mongoose';
import { describe, expect, test } from 'vitest';

import { recipeSchema, zRecipeFormSchema, zRecipeInterface } from './recipe';

const recipeId = new Types.ObjectId().toString();
const tagId = new Types.ObjectId().toString();
const plannerId = new Types.ObjectId().toString();

const validRecipe = {
	_id: recipeId,
	name: "Maleficent's Dark Forest Stew",
	ingredients: ['raven feathers', 'thorn berries', 'moonwater'],
	instructions: ['Gather at midnight', 'Stir counterclockwise until cursed'],
};

describe('recipe interface', () => {
	test('accepts a minimal valid recipe', () => {
		expect(zRecipeInterface.safeParse(validRecipe).success).toBe(true);
	});

	test('accepts a fully populated recipe', () => {
		expect(
			zRecipeInterface.safeParse({
				...validRecipe,
				notes: 'Serve cold — warmth dispels the curse',
				servings: 4,
				source: {
					name: 'Dark Grimoire Vol. II',
					url: 'https://grimoire.example.com',
				},
				storage: 'Sealed cauldron in a cool cave',
				tags: [tagId],
				time: {
					prep: '10 min',
					cook: '1 hour',
					total: '1 hour 10 min',
					actual: '1 hour 15 min',
				},
			}).success,
		).toBe(true);
	});

	test('accepts a recipe with a source that has no URL', () => {
		expect(
			zRecipeInterface.safeParse({
				...validRecipe,
				source: { name: 'Dark Grimoire Vol. II' },
			}).success,
		).toBe(true);
	});

	test('accepts a recipe with partial time fields', () => {
		expect(
			zRecipeInterface.safeParse({
				...validRecipe,
				time: { prep: '10 min' },
			}).success,
		).toBe(true);
	});

	test('rejects a recipe missing name', () => {
		const { name: _, ...rest } = validRecipe;
		expect(zRecipeInterface.safeParse(rest).success).toBe(false);
	});

	test('rejects a recipe missing ingredients', () => {
		const { ingredients: _, ...rest } = validRecipe;
		expect(zRecipeInterface.safeParse(rest).success).toBe(false);
	});

	test('rejects a recipe missing instructions', () => {
		const { instructions: _, ...rest } = validRecipe;
		expect(zRecipeInterface.safeParse(rest).success).toBe(false);
	});

	test('rejects a recipe with an invalid source URL', () => {
		expect(
			zRecipeInterface.safeParse({
				...validRecipe,
				source: { name: 'Dark Grimoire', url: 'not-a-url' },
			}).success,
		).toBe(false);
	});

	test('rejects a recipe with an invalid tag ObjectId', () => {
		expect(
			zRecipeInterface.safeParse({ ...validRecipe, tags: ['not-an-id'] })
				.success,
		).toBe(false);
	});

	test('rejects a recipe with a non-numeric servings value', () => {
		expect(
			zRecipeInterface.safeParse({ ...validRecipe, servings: 'four' }).success,
		).toBe(false);
	});
});

describe('recipe form schema', () => {
	const { _id: _, ...recipeWithoutId } = validRecipe;

	test('accepts a valid recipe form submission', () => {
		expect(
			zRecipeFormSchema.safeParse({ ...recipeWithoutId, plannerId }).success,
		).toBe(true);
	});

	test('rejects a form submission missing plannerId', () => {
		expect(zRecipeFormSchema.safeParse(recipeWithoutId).success).toBe(false);
	});
});

describe('recipe schema', () => {
	// SchemaTypes.Union does not traverse nested validators via validateSync(), so
	// we access the validator function directly from the schema definition object.
	// biome-ignore lint/suspicious/noExplicitAny: accessing internal Mongoose schema definition
	const sourceOfDef = (recipeSchema.obj.source as any).of[1];
	const urlValidator: (v: unknown) => boolean = sourceOfDef.url.validate[0];

	test('source URL validator accepts a valid URL', () => {
		expect(urlValidator('https://villains.example.com')).toBe(true);
	});

	test('source URL validator rejects an invalid URL', () => {
		expect(urlValidator('not-a-url')).toBe(false);
	});

	test('_id is not explicitly defined (Mongoose auto-adds it)', () => {
		expect((recipeSchema.obj as Record<string, unknown>)._id).toBeUndefined();
	});
});
