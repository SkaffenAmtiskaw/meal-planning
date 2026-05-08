import { revalidatePath } from 'next/cache';

import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth';
import { Planner } from '@/_models/planner';

import { updateRecipeNotes } from './updateRecipeNotes';

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

const validData = { plannerId, recipeId, notes: 'Great recipe' };

describe('updateRecipeNotes', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);
	});

	it('throws on invalid input', async () => {
		await expect(updateRecipeNotes({})).rejects.toThrow();
	});

	it('throws when plannerId is missing', async () => {
		await expect(updateRecipeNotes({ recipeId, notes: 'x' })).rejects.toThrow();
	});

	it('throws when recipeId is missing', async () => {
		await expect(
			updateRecipeNotes({ plannerId, notes: 'x' }),
		).rejects.toThrow();
	});

	it('throws when notes is missing', async () => {
		await expect(updateRecipeNotes({ plannerId, recipeId })).rejects.toThrow();
	});

	it('returns unauthorized error when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthenticated' });

		const result = await updateRecipeNotes(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(Planner.collection.updateOne).not.toHaveBeenCalled();
	});

	it('returns unauthorized error when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthorized' });

		const result = await updateRecipeNotes(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
	});

	it('calls checkAuth with write access', async () => {
		await updateRecipeNotes(validData);

		expect(checkAuth).toHaveBeenCalledWith(expect.any(Types.ObjectId), 'write');
	});

	it('returns recipe not found error when recipe is not found', async () => {
		vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({
			matchedCount: 0,
		} as never);

		const result = await updateRecipeNotes(validData);

		expect(result).toEqual({ ok: false, error: 'Recipe not found' });
	});

	it('sets notes with $set when notes is non-empty', async () => {
		await updateRecipeNotes(validData);

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.objectContaining({
				_id: expect.any(Types.ObjectId),
				'saved._id': expect.any(Types.ObjectId),
			}),
			{ $set: { 'saved.$.notes': 'Great recipe' } },
		);
	});

	it('unsets notes with $unset when notes is empty', async () => {
		await updateRecipeNotes({ plannerId, recipeId, notes: '' });

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.objectContaining({
				_id: expect.any(Types.ObjectId),
				'saved._id': expect.any(Types.ObjectId),
			}),
			{ $unset: { 'saved.$.notes': '' } },
		);
	});

	it('revalidates recipe path on success', async () => {
		await updateRecipeNotes(validData);

		expect(revalidatePath).toHaveBeenCalledWith(
			`/${plannerId}/recipes/${recipeId}`,
		);
	});

	it('does not revalidate when recipe is not found', async () => {
		vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({
			matchedCount: 0,
		} as never);

		const result = await updateRecipeNotes(validData);

		expect(result).toEqual({ ok: false, error: 'Recipe not found' });
		expect(revalidatePath).not.toHaveBeenCalled();
	});

	it('returns ok on success', async () => {
		const result = await updateRecipeNotes(validData);

		expect(result).toEqual({ ok: true, data: undefined });
	});
});
