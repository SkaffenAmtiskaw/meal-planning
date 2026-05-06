import { revalidatePath } from 'next/cache';

import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth';
import { Planner } from '@/_models';

import { updateRecipeTags } from './updateRecipeTags';

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));

vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}));

vi.mock('@/_models', () => ({
	Planner: {
		collection: {
			updateOne: vi.fn(),
		},
	},
}));

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

	it('throws on invalid input', async () => {
		await expect(updateRecipeTags({})).rejects.toThrow();
	});

	it('returns unauthorized error when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthenticated' });

		const result = await updateRecipeTags(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(Planner.collection.updateOne).not.toHaveBeenCalled();
	});

	it('returns unauthorized error when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthorized' });

		const result = await updateRecipeTags(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
	});

	it('returns recipe not found error when matchedCount is 0', async () => {
		vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({
			matchedCount: 0,
		} as never);

		const result = await updateRecipeTags(validData);

		expect(result).toEqual({ ok: false, error: 'Recipe not found' });
	});

	it('calls checkAuth with write access', async () => {
		await updateRecipeTags(validData);

		expect(checkAuth).toHaveBeenCalledWith(expect.any(Types.ObjectId), 'write');
	});

	it('sets tags as ObjectIds on success', async () => {
		await updateRecipeTags(validData);

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.objectContaining({
				_id: expect.any(Types.ObjectId),
				'saved._id': expect.any(Types.ObjectId),
			}),
			{ $set: { 'saved.$.tags': [expect.any(Types.ObjectId)] } },
		);
	});

	it('sets empty tags array when tags is empty', async () => {
		await updateRecipeTags({ plannerId, recipeId, tags: [] });

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.objectContaining({
				_id: expect.any(Types.ObjectId),
				'saved._id': expect.any(Types.ObjectId),
			}),
			{ $set: { 'saved.$.tags': [] } },
		);
	});

	it('revalidates the recipe path on success', async () => {
		await updateRecipeTags(validData);

		expect(revalidatePath).toHaveBeenCalledWith(
			`/${plannerId}/recipes/${recipeId}`,
		);
	});

	it('does not revalidate when recipe is not found', async () => {
		vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({
			matchedCount: 0,
		} as never);

		const result = await updateRecipeTags(validData);

		expect(result).toEqual({ ok: false, error: 'Recipe not found' });
		expect(revalidatePath).not.toHaveBeenCalled();
	});

	it('returns ok on success', async () => {
		const result = await updateRecipeTags(validData);

		expect(result).toEqual({ ok: true, data: undefined });
	});
});
