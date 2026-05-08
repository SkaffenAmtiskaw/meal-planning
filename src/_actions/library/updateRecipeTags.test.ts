import { revalidatePath } from 'next/cache';

import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth';
import { Planner } from '@/_models/planner';

import { updateRecipeTags } from './updateRecipeTags';

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));

vi.mock('next/cache', async () => ({
	revalidatePath: vi.fn(),
}));

vi.mock(
	'@/_models/planner',
	async () => await import('@mocks/@/_models/planner'),
);

const plannerId = new Types.ObjectId().toString();
const recipeId = new Types.ObjectId().toString();
const tagId = new Types.ObjectId().toString();

const validData = { plannerId, recipeId, tags: [tagId] };

describe('updateRecipeTags', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);
	});

	describe('input validation', () => {
		it('throws on invalid input', async () => {
			await expect(updateRecipeTags({})).rejects.toThrow();
		});
	});

	describe('authorization', () => {
		it('calls checkAuth with write access', async () => {
			await updateRecipeTags(validData);

			expect(checkAuth).toHaveBeenCalledWith(
				expect.any(Types.ObjectId),
				'write',
			);
		});

		it('returns unauthorized when session is missing', async () => {
			vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthenticated' });

			const result = await updateRecipeTags(validData);

			expect(result).toEqual({ ok: false, error: 'Unauthorized' });
			expect(Planner.collection.updateOne).not.toHaveBeenCalled();
		});

		it('returns unauthorized when user does not own the planner', async () => {
			vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthorized' });

			const result = await updateRecipeTags(validData);

			expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		});
	});

	describe('when recipe is not found', () => {
		beforeEach(() => {
			vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({
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
		it('updates the recipe tags as ObjectIds', async () => {
			await updateRecipeTags(validData);

			expect(Planner.collection.updateOne).toHaveBeenCalledWith(
				expect.objectContaining({
					_id: expect.any(Types.ObjectId),
					'saved._id': expect.any(Types.ObjectId),
				}),
				{ $set: { 'saved.$.tags': [expect.any(Types.ObjectId)] } },
			);
		});

		it('updates the recipe tags to an empty array when tags is empty', async () => {
			await updateRecipeTags({ plannerId, recipeId, tags: [] });

			expect(Planner.collection.updateOne).toHaveBeenCalledWith(
				expect.objectContaining({
					_id: expect.any(Types.ObjectId),
					'saved._id': expect.any(Types.ObjectId),
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
