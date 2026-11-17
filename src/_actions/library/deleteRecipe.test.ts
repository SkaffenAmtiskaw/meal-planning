import { afterEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { planners } from '@/_models/database/planners';

import { deleteRecipe } from './deleteRecipe';

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
	afterEach(() => {
		vi.resetAllMocks();
	});

	it('throws on invalid input', async () => {
		await expect(deleteRecipe({})).rejects.toThrow();
	});

	it('returns Unauthorized when user is unauthenticated', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthenticated' });

		const result = await deleteRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(planners.updateOne).not.toHaveBeenCalled();
	});

	it('returns Unauthorized when user is unauthorized', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthorized' });

		const result = await deleteRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(planners.updateOne).not.toHaveBeenCalled();
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
});
