import { beforeEach, describe, expect, it, vi } from 'vitest';

import { plannerCache } from '@/_actions/_utils/caches';
import { invalidate } from '@/_actions/_utils/invalidate';
import { checkAuth } from '@/_actions/auth/checkAuth';
import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';

import { updateRecipeNotes } from './updateRecipeNotes';

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

const plannerId = newId();
const recipeId = newId();

const validData = { plannerId, recipeId, notes: 'Great recipe' };

describe('updateRecipeNotes', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("checks write access to the recipe's planner", async () => {
		await updateRecipeNotes(validData);

		expect(checkAuth).toHaveBeenCalledWith(plannerId, 'write');
	});

	it('returns Recipe not found when no planner has the recipe', async () => {
		vi.mocked(planners.updateOne).mockResolvedValueOnce({
			matchedCount: 0,
		} as never);

		const result = await updateRecipeNotes(validData);

		expect(result).toEqual({ ok: false, error: 'Recipe not found' });
	});

	it('sets notes with $set when notes is non-empty', async () => {
		await updateRecipeNotes(validData);

		expect(planners.updateOne).toHaveBeenCalledWith(
			{ _id: plannerId, 'saved._id': recipeId },
			{ $set: { 'saved.$.notes': 'Great recipe' } },
		);
	});

	it('unsets notes with $unset when notes is empty', async () => {
		await updateRecipeNotes({ plannerId, recipeId, notes: '' });

		expect(planners.updateOne).toHaveBeenCalledWith(
			{ _id: plannerId, 'saved._id': recipeId },
			{ $unset: { 'saved.$.notes': '' } },
		);
	});

	it('returns ok on success', async () => {
		const result = await updateRecipeNotes(validData);

		expect(result).toEqual({ ok: true, data: undefined });
	});

	it("invalidates the planner's saved items", async () => {
		await updateRecipeNotes(validData);

		expect(invalidate).toHaveBeenCalledWith([plannerCache.saved(plannerId)]);
	});
});
