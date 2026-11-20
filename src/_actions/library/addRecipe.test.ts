import { beforeEach, describe, expect, test, vi } from 'vitest';

import { plannerCache } from '@/_actions/_utils/caches';
import { invalidate } from '@/_actions/_utils/invalidate';
import { checkAuth } from '@/_actions/auth/checkAuth';
import { planners } from '@/_models/database/planners';
import { zRecipeFormSchema } from '@/_models/library';

import { addRecipe } from './addRecipe';

vi.mock(
	'@/_actions/_utils/invalidate',
	async () => await import('#mocks/@/_actions/_utils/invalidate'),
);
vi.mock(
	'@/_actions/auth/checkAuth',
	async () => await import('#mocks/@/_actions/auth/checkAuth'),
);
vi.mock(
	'@/_models/library',
	async () => await import('#mocks/@/_models/library'),
);
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
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(zRecipeFormSchema.safeParse).mockReturnValue({
			success: true,
			data: validData,
		} as never);
	});

	test("checks write access to the recipe's planner", async () => {
		await addRecipe(validData);

		expect(checkAuth).toHaveBeenCalledWith(plannerId, 'write');
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

	test("invalidates the planner's saved items", async () => {
		await addRecipe(validData);

		expect(invalidate).toHaveBeenCalledWith([plannerCache.saved(plannerId)]);
	});
});
