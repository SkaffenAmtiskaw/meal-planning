import { beforeEach, describe, expect, it, vi } from 'vitest';

import { plannerCache } from '@/_actions/_utils/caches';
import { invalidate } from '@/_actions/_utils/invalidate';
import { checkAuth } from '@/_actions/auth/checkAuth';
import { planners } from '@/_models/database/planners';

import { deleteRecipe } from './deleteRecipe';

vi.mock(
	'@/_actions/_utils/invalidate',
	async () => await import('#mocks/@/_actions/_utils/invalidate'),
);
vi.mock(
	'@/_actions/auth/checkAuth',
	async () => await import('#mocks/@/_actions/auth/checkAuth'),
);
vi.mock(
	'@/_models/database/planners',
	async () => await import('#mocks/@/_models/database/planners'),
);

const plannerId = '507f1f77bcf86cd799439011';
const recipeId = '507f1f77bcf86cd799439012';

const validData = { plannerId, recipeId };

describe('deleteRecipe', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("checks write access to the recipe's planner", async () => {
		await deleteRecipe(validData);

		expect(checkAuth).toHaveBeenCalledWith(plannerId, 'write');
	});

	it('returns Recipe not found when no planner has the recipe', async () => {
		vi.mocked(planners.updateOne).mockResolvedValueOnce({
			matchedCount: 0,
		} as never);

		const result = await deleteRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Recipe not found' });
	});

	it('pulls the recipe from the planner and returns ok', async () => {
		const result = await deleteRecipe(validData);

		expect(planners.updateOne).toHaveBeenCalledWith(
			{ _id: plannerId, 'saved._id': recipeId },
			{ $pull: { saved: { _id: recipeId } } },
		);
		expect(result).toEqual({ ok: true, data: undefined });
	});

	it("invalidates the planner's saved items", async () => {
		await deleteRecipe(validData);

		expect(invalidate).toHaveBeenCalledWith([plannerCache.saved(plannerId)]);
	});
});
