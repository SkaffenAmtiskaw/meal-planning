import { beforeEach, describe, expect, it, vi } from 'vitest';

import { revalidatePath } from 'next/cache';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';

import { updateRecipeTags } from './updateRecipeTags';

vi.mock(
	'@/_actions/auth/checkAuth',
	async () => await import('#mocks/@/_actions/auth/checkAuth'),
);

vi.mock('next/cache', async () => ({
	revalidatePath: vi.fn(),
}));

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

	describe('input validation', () => {
		it('throws on invalid input', async () => {
			await expect(updateRecipeTags({})).rejects.toThrow();
		});
	});

	describe('authorization', () => {
		it('calls checkAuth with write access', async () => {
			await updateRecipeTags(validData);

			expect(checkAuth).toHaveBeenCalledWith(plannerId, 'write');
		});

		it('returns unauthorized when session is missing', async () => {
			vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthenticated' });

			const result = await updateRecipeTags(validData);

			expect(result).toEqual({ ok: false, error: 'Unauthorized' });
			expect(planners.updateOne).not.toHaveBeenCalled();
		});

		it('returns unauthorized when user does not own the planner', async () => {
			vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthorized' });

			const result = await updateRecipeTags(validData);

			expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		});
	});

	describe('when recipe is not found', () => {
		beforeEach(() => {
			vi.mocked(planners.updateOne).mockResolvedValueOnce({
				matchedCount: 0,
			} as never);
		});

		it('returns recipe not found error', async () => {
			const result = await updateRecipeTags(validData);

			expect(result).toEqual({ ok: false, error: 'Recipe not found' });
		});

		it('does not revalidate the path', async () => {
			await updateRecipeTags(validData);

			expect(revalidatePath).not.toHaveBeenCalled();
		});
	});

	describe('on success', () => {
		it('updates the recipe tags to the given ids', async () => {
			await updateRecipeTags(validData);

			expect(planners.updateOne).toHaveBeenCalledWith(
				expect.objectContaining({
					_id: plannerId,
					'saved._id': recipeId,
				}),
				{ $set: { 'saved.$.tags': [tagId] } },
			);
		});

		it('updates the recipe tags to an empty array when tags is empty', async () => {
			await updateRecipeTags({ plannerId, recipeId, tags: [] });

			expect(planners.updateOne).toHaveBeenCalledWith(
				expect.objectContaining({
					_id: plannerId,
					'saved._id': recipeId,
				}),
				{ $set: { 'saved.$.tags': [] } },
			);
		});

		it('revalidates the recipe path', async () => {
			await updateRecipeTags(validData);

			expect(revalidatePath).toHaveBeenCalledWith(
				`/${plannerId}/recipes/${recipeId}`,
			);
		});

		it('returns ok', async () => {
			const result = await updateRecipeTags(validData);

			expect(result).toEqual({ ok: true, data: undefined });
		});
	});
});
