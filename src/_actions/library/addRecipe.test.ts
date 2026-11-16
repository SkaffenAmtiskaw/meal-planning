import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { planners } from '@/_models/database/planners';
import { zRecipeFormSchema } from '@/_models/library';

import { addRecipe } from './addRecipe';

vi.mock(
	'@/_actions/auth/checkAuth',
	async () => await import('#mocks/@/_actions/auth/checkAuth'),
);

vi.mock('@/_models/library', () => ({
	zRecipeFormSchema: {
		parse: vi.fn((data) => data),
	},
}));

vi.mock('./_utils/transformRecipeForm', () => ({
	transformRecipeForm: vi.fn((data) => data),
}));

vi.mock(
	'@/_models/database/planners',
	async () => await import('#mocks/@/_models/database/planners'),
);
vi.mock(
	'@/_models/database/newId',
	async () => await import('#mocks/@/_models/database/newId'),
);

const plannerId = '507f1f77bcf86cd799439011';

const validData = {
	plannerId,
	name: 'Croissant',
	ingredients: ['2 cups flour', '1 stick butter'],
	instructions: ['Mix ingredients', 'Bake at 400°F'],
};

describe('addRecipe', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('throws when schema validation fails', async () => {
		vi.mocked(zRecipeFormSchema.parse).mockImplementationOnce(() => {
			throw new Error('Validation failed');
		});

		await expect(addRecipe({})).rejects.toThrow('Validation failed');
	});

	test('returns Unauthorized error when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthenticated' });

		const result = await addRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(planners.updateOne).not.toHaveBeenCalled();
	});

	test('returns Unauthorized error when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthorized' });

		const result = await addRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
	});

	test('returns Planner not found error when planner does not exist', async () => {
		vi.mocked(planners.updateOne).mockResolvedValueOnce({
			matchedCount: 0,
		} as never);

		const result = await addRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Planner not found' });
	});

	test('pushes the recipe with a new id and returns that id and its name', async () => {
		const { plannerId: _, ...recipeFields } = validData;

		const result = await addRecipe(validData);

		expect(planners.updateOne).toHaveBeenCalledWith(
			{ _id: plannerId },
			{ $push: { saved: { _id: 'new-id', ...recipeFields } } },
		);
		expect(result).toEqual({
			ok: true,
			data: { _id: 'new-id', name: 'Croissant' },
		});
	});
});
