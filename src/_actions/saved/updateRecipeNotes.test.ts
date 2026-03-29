import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';

import { updateRecipeNotes } from './updateRecipeNotes';

vi.mock('@/_actions/auth/checkAuth', () => ({
	checkAuth: vi.fn(),
}));

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

const validData = { plannerId, recipeId, notes: 'Great recipe' };

describe('updateRecipeNotes', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('throws ZodError on invalid input', async () => {
		await expect(updateRecipeNotes({})).rejects.toThrow();
	});

	test('throws ZodError when plannerId is missing', async () => {
		await expect(updateRecipeNotes({ recipeId, notes: 'x' })).rejects.toThrow();
	});

	test('throws ZodError when recipeId is missing', async () => {
		await expect(
			updateRecipeNotes({ plannerId, notes: 'x' }),
		).rejects.toThrow();
	});

	test('throws ZodError when notes is missing', async () => {
		await expect(updateRecipeNotes({ plannerId, recipeId })).rejects.toThrow();
	});

	test('throws Unauthorized when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthenticated' });

		await expect(updateRecipeNotes(validData)).rejects.toThrow('Unauthorized');
		expect(Planner.collection.updateOne).not.toHaveBeenCalled();
	});

	test('throws Unauthorized when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthorized' });

		await expect(updateRecipeNotes(validData)).rejects.toThrow('Unauthorized');
	});

	test('throws Recipe not found when matchedCount is 0', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 0,
		} as never);

		await expect(updateRecipeNotes(validData)).rejects.toThrow(
			'Recipe not found',
		);
	});

	test('uses $set when notes is non-empty', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		await updateRecipeNotes(validData);

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.objectContaining({ 'saved._id': expect.any(Types.ObjectId) }),
			{ $set: { 'saved.$.notes': 'Great recipe' } },
		);
	});

	test('uses $unset when notes is empty string', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		await updateRecipeNotes({ plannerId, recipeId, notes: '' });

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.objectContaining({ 'saved._id': expect.any(Types.ObjectId) }),
			{ $unset: { 'saved.$.notes': '' } },
		);
	});

	test('revalidates the recipe path on success', async () => {
		const { revalidatePath } = await import('next/cache');
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		await updateRecipeNotes(validData);

		expect(revalidatePath).toHaveBeenCalledWith(
			`/${plannerId}/recipes/${recipeId}`,
		);
	});

	test('does not revalidate when recipe is not found', async () => {
		const { revalidatePath } = await import('next/cache');
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 0,
		} as never);

		await expect(updateRecipeNotes(validData)).rejects.toThrow();
		expect(revalidatePath).not.toHaveBeenCalled();
	});
});
