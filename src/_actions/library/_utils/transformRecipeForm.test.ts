import { describe, expect, it } from 'vitest';

import { zRecipeFormSchema } from '@/_models/planner/recipe.types';

import { transformRecipeForm } from './transformRecipeForm';

type RecipeFormInput = Parameters<typeof transformRecipeForm>[0];

describe('transformRecipeForm', () => {
	describe('source transformation', () => {
		it('removes source when name is empty', () => {
			const input: RecipeFormInput = {
				plannerId: 'test-planner',
				name: 'Test Recipe',
				ingredients: ['ingredient'],
				instructions: ['instruction'],
				source: { name: '', url: '' },
			};

			const result = transformRecipeForm(input);

			// Verify schema passes
			expect(() => zRecipeFormSchema.parse(result)).not.toThrow();

			// Verify no data loss
			expect(result.name).toBe(input.name);
			expect(result.plannerId).toBe(input.plannerId);
			expect(result.ingredients).toEqual(input.ingredients);
			expect(result.instructions).toEqual(input.instructions);
			expect(result.source).toBeUndefined();
		});

		it('sets url to undefined when url is empty string', () => {
			const input: RecipeFormInput = {
				plannerId: 'test-planner',
				name: 'Test Recipe',
				ingredients: ['ingredient'],
				instructions: ['instruction'],
				source: { name: 'Recipe Blog', url: '' },
			};

			const result = transformRecipeForm(input);

			// Verify schema passes
			expect(() => zRecipeFormSchema.parse(result)).not.toThrow();

			// Verify no data loss
			expect(result.name).toBe(input.name);
			expect(result.plannerId).toBe(input.plannerId);
			expect(result.ingredients).toEqual(input.ingredients);
			expect(result.instructions).toEqual(input.instructions);
			expect(result.source?.name).toBe('Recipe Blog');
			expect(result.source?.url).toBeUndefined();
		});

		it('preserves source when both name and url have values', () => {
			const input: RecipeFormInput = {
				plannerId: 'test-planner',
				name: 'Test Recipe',
				ingredients: ['ingredient'],
				instructions: ['instruction'],
				source: { name: 'Recipe Blog', url: 'https://example.com' },
			};

			const result = transformRecipeForm(input);

			// Verify schema passes
			expect(() => zRecipeFormSchema.parse(result)).not.toThrow();

			// Verify no data loss
			expect(result.name).toBe(input.name);
			expect(result.plannerId).toBe(input.plannerId);
			expect(result.ingredients).toEqual(input.ingredients);
			expect(result.instructions).toEqual(input.instructions);
			expect(result.source?.name).toBe('Recipe Blog');
			expect(result.source?.url).toBe('https://example.com');
		});
	});

	describe('time transformation', () => {
		it('removes time when all fields are empty', () => {
			const input: RecipeFormInput = {
				plannerId: 'test-planner',
				name: 'Test Recipe',
				ingredients: ['ingredient'],
				instructions: ['instruction'],
				time: { prep: '', cook: '', total: '', actual: '' },
			};

			const result = transformRecipeForm(input);

			// Verify schema passes
			expect(() => zRecipeFormSchema.parse(result)).not.toThrow();

			// Verify no data loss
			expect(result.name).toBe(input.name);
			expect(result.plannerId).toBe(input.plannerId);
			expect(result.ingredients).toEqual(input.ingredients);
			expect(result.instructions).toEqual(input.instructions);
			expect(result.time).toBeUndefined();
		});

		it('converts empty fields to undefined when some have values', () => {
			const input: RecipeFormInput = {
				plannerId: 'test-planner',
				name: 'Test Recipe',
				ingredients: ['ingredient'],
				instructions: ['instruction'],
				time: { prep: '30m', cook: '', total: '50m', actual: '' },
			};

			const result = transformRecipeForm(input);

			// Verify schema passes
			expect(() => zRecipeFormSchema.parse(result)).not.toThrow();

			// Verify no data loss
			expect(result.name).toBe(input.name);
			expect(result.plannerId).toBe(input.plannerId);
			expect(result.ingredients).toEqual(input.ingredients);
			expect(result.instructions).toEqual(input.instructions);
			expect(result.time?.prep).toBe('30m');
			expect(result.time?.cook).toBeUndefined();
			expect(result.time?.total).toBe('50m');
			expect(result.time?.actual).toBeUndefined();
		});

		it('preserves only non-empty time fields', () => {
			const input: RecipeFormInput = {
				plannerId: 'test-planner',
				name: 'Test Recipe',
				ingredients: ['ingredient'],
				instructions: ['instruction'],
				time: { prep: '15m', cook: '', total: '', actual: '' },
			};

			const result = transformRecipeForm(input);

			// Verify schema passes
			expect(() => zRecipeFormSchema.parse(result)).not.toThrow();

			// Verify no data loss
			expect(result.name).toBe(input.name);
			expect(result.plannerId).toBe(input.plannerId);
			expect(result.ingredients).toEqual(input.ingredients);
			expect(result.instructions).toEqual(input.instructions);
			expect(result.time?.prep).toBe('15m');
			expect(result.time?.cook).toBeUndefined();
			expect(result.time?.total).toBeUndefined();
			expect(result.time?.actual).toBeUndefined();
		});

		it('handles undefined time and removes it from result', () => {
			const input: RecipeFormInput = {
				plannerId: 'test-planner',
				name: 'Test Recipe',
				ingredients: ['ingredient'],
				instructions: ['instruction'],
			};

			const result = transformRecipeForm(input);

			// Verify schema passes
			expect(() => zRecipeFormSchema.parse(result)).not.toThrow();

			// Verify no data loss
			expect(result.name).toBe(input.name);
			expect(result.plannerId).toBe(input.plannerId);
			expect(result.ingredients).toEqual(input.ingredients);
			expect(result.instructions).toEqual(input.instructions);
			expect(result.time).toBeUndefined();
		});

		it('handles time object with undefined prep field', () => {
			const input: RecipeFormInput = {
				plannerId: 'test-planner',
				name: 'Test Recipe',
				ingredients: ['ingredient'],
				instructions: ['instruction'],
				time: {
					prep: undefined,
					cook: '20m',
					total: '',
					actual: '',
				} as unknown as RecipeFormInput['time'],
			};

			const result = transformRecipeForm(input);

			// Verify schema passes
			expect(() => zRecipeFormSchema.parse(result)).not.toThrow();

			// Verify no data loss
			expect(result.name).toBe(input.name);
			expect(result.plannerId).toBe(input.plannerId);
			expect(result.ingredients).toEqual(input.ingredients);
			expect(result.instructions).toEqual(input.instructions);
			expect(result.time?.prep).toBeUndefined();
			expect(result.time?.cook).toBe('20m');
			expect(result.time?.total).toBeUndefined();
			expect(result.time?.actual).toBeUndefined();
		});
	});

	describe('other fields', () => {
		it('preserves all non-source/time fields unchanged', () => {
			const tagIds = ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'];
			const input = {
				plannerId: 'test-planner',
				name: 'Test Recipe',
				ingredients: ['flour', 'sugar'],
				instructions: ['mix', 'bake'],
				notes: 'Test notes',
				servings: 4,
				storage: 'Room temperature',
				tags: tagIds,
			} as unknown as RecipeFormInput;

			const result = transformRecipeForm(input);

			// Verify schema passes
			expect(() => zRecipeFormSchema.parse(result)).not.toThrow();

			// Verify no data loss
			expect(result.plannerId).toBe(input.plannerId);
			expect(result.name).toBe(input.name);
			expect(result.ingredients).toEqual(input.ingredients);
			expect(result.instructions).toEqual(input.instructions);
			expect(result.notes).toBe(input.notes);
			expect(result.servings).toBe(input.servings);
			expect(result.storage).toBe(input.storage);
			expect(result.tags).toEqual(tagIds);
		});

		it('handles undefined source without error', () => {
			const input: RecipeFormInput = {
				plannerId: 'test-planner',
				name: 'Test Recipe',
				ingredients: ['ingredient'],
				instructions: ['instruction'],
			};

			const result = transformRecipeForm(input);

			// Verify schema passes
			expect(() => zRecipeFormSchema.parse(result)).not.toThrow();

			// Verify no data loss
			expect(result.name).toBe(input.name);
			expect(result.plannerId).toBe(input.plannerId);
			expect(result.ingredients).toEqual(input.ingredients);
			expect(result.instructions).toEqual(input.instructions);
			expect(result.source).toBeUndefined();
		});
	});
});
