import { beforeEach, describe, expect, it, vi } from 'vitest';

import { plannerCache } from '@/_actions/_utils/caches';
import { invalidate } from '@/_actions/_utils/invalidate';
import { checkAuth } from '@/_actions/auth/checkAuth';
import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';

import { updateRecipeTags } from './updateRecipeTags';

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
const tagId = newId();

const validData = { plannerId, recipeId, tags: [tagId] };

describe('updateRecipeTags', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("checks write access to the recipe's planner", async () => {
		await updateRecipeTags(validData);

		expect(checkAuth).toHaveBeenCalledWith(plannerId, 'write');
	});

	it('returns Recipe not found when no planner has the recipe', async () => {
		vi.mocked(planners.updateOne).mockResolvedValueOnce({
			matchedCount: 0,
		} as never);

		const result = await updateRecipeTags(validData);

		expect(result).toEqual({ ok: false, error: 'Recipe not found' });
	});

	it('sets the recipe tags to the given ids', async () => {
		await updateRecipeTags(validData);

		expect(planners.updateOne).toHaveBeenCalledWith(
			{ _id: plannerId, 'saved._id': recipeId },
			{ $set: { 'saved.$.tags': [tagId] } },
		);
	});

	it('returns ok on success', async () => {
		const result = await updateRecipeTags(validData);

		expect(result).toEqual({ ok: true, data: undefined });
	});

	it("invalidates the planner's saved items", async () => {
		await updateRecipeTags(validData);

		expect(invalidate).toHaveBeenCalledWith([plannerCache.saved(plannerId)]);
	});
});
