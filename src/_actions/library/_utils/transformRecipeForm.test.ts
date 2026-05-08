import { describe, expect, it } from 'vitest';

import { transformRecipeForm } from './transformRecipeForm';

type RecipeFormInput = Parameters<typeof transformRecipeForm>[0];

const baseInput = {
	plannerId: 'test-planner',
	name: 'Test Recipe',
	ingredients: ['ingredient'],
	instructions: ['instruction'],
} satisfies RecipeFormInput;

describe('transformRecipeForm', () => {
	describe('source transformation', () => {
		it('removes source when source name is empty', () => {
			const input: RecipeFormInput = {
				...baseInput,
				source: { name: '', url: '' },
			};

			const result = transformRecipeForm(input);

			expect(result.source).toBeUndefined();
		});

		it('removes source when source name is empty but url is present', () => {
			const input: RecipeFormInput = {
				...baseInput,
				source: { name: '', url: 'https://example.com' },
			};

			const result = transformRecipeForm(input);

			expect(result.source).toBeUndefined();
		});

		it('converts empty source url to undefined when source name is present', () => {
			const input: RecipeFormInput = {
				...baseInput,
				source: { name: 'Recipe Blog', url: '' },
			};

			const result = transformRecipeForm(input);

			expect(result.source).toEqual({ name: 'Recipe Blog', url: undefined });
		});

		it('preserves source when both name and url have values', () => {
			const input: RecipeFormInput = {
				...baseInput,
				source: { name: 'Recipe Blog', url: 'https://example.com' },
			};

			const result = transformRecipeForm(input);

			expect(result.source).toEqual({
				name: 'Recipe Blog',
				url: 'https://example.com',
			});
		});

		it('does not add source when it is undefined', () => {
			const input: RecipeFormInput = { ...baseInput };

			const result = transformRecipeForm(input);

			expect(result.source).toBeUndefined();
		});
	});

	describe('time transformation', () => {
		it('removes time when all fields are empty strings', () => {
			const input: RecipeFormInput = {
				...baseInput,
				time: { prep: '', cook: '', total: '', actual: '' },
			};

			const result = transformRecipeForm(input);

			expect(result.time).toBeUndefined();
		});

		it('converts empty time fields to undefined when some fields have values', () => {
			const input: RecipeFormInput = {
				...baseInput,
				time: { prep: '30m', cook: '', total: '50m', actual: '' },
			};

			const result = transformRecipeForm(input);

			expect(result.time).toEqual({
				prep: '30m',
				cook: undefined,
				total: '50m',
				actual: undefined,
			});
		});

		it('does not add time when it is undefined', () => {
			const input: RecipeFormInput = { ...baseInput };

			const result = transformRecipeForm(input);

			expect(result.time).toBeUndefined();
		});

		it('handles undefined individual time fields', () => {
			const input: RecipeFormInput = {
				...baseInput,
				time: { prep: undefined, cook: '20m', total: '', actual: '' },
			};

			const result = transformRecipeForm(input);

			expect(result.time).toEqual({
				prep: undefined,
				cook: '20m',
				total: undefined,
				actual: undefined,
			});
		});
	});

	describe('other fields', () => {
		it('preserves non-source and non-time fields unchanged', () => {
			const input: RecipeFormInput = {
				plannerId: 'test-planner',
				name: 'Test Recipe',
				ingredients: ['flour', 'sugar'],
				instructions: ['mix', 'bake'],
				notes: 'Test notes',
				servings: 4,
				storage: 'Room temperature',
			};

			const result = transformRecipeForm(input);

			expect(result.plannerId).toBe(input.plannerId);
			expect(result.name).toBe(input.name);
			expect(result.ingredients).toEqual(input.ingredients);
			expect(result.instructions).toEqual(input.instructions);
			expect(result.notes).toBe(input.notes);
			expect(result.servings).toBe(input.servings);
			expect(result.storage).toBe(input.storage);
		});
	});
});
