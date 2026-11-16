import { describe, expect, test } from 'vitest';

import { zRecipeFormSchema, zRecipeInterface } from './recipe.types';

import { newId } from '../database/newId';

const recipeId = newId();
const tagId = newId();
const plannerId = newId();

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

	test('rejects a recipe with an invalid tag id', () => {
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

	test('accepts optional fields set to empty strings, which the form starts at', () => {
		expect(
			zRecipeFormSchema.safeParse({
				...recipeWithoutId,
				plannerId,
				notes: '',
				storage: '',
				source: { name: '', url: '' },
				time: { prep: '', cook: '', total: '', actual: '' },
			}).success,
		).toBe(true);
	});
});
