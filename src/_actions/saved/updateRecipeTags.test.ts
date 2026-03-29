import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';

import { updateRecipeTags } from './updateRecipeTags';

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
const tagId = new Types.ObjectId().toString();

const validData = { plannerId, recipeId, tags: [tagId] };

describe('updateRecipeTags', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('throws ZodError on invalid input', async () => {
		await expect(updateRecipeTags({})).rejects.toThrow();
	});

	test('throws ZodError when plannerId is missing', async () => {
		await expect(updateRecipeTags({ recipeId, tags: [] })).rejects.toThrow();
	});

	test('throws ZodError when recipeId is missing', async () => {
		await expect(updateRecipeTags({ plannerId, tags: [] })).rejects.toThrow();
	});

	test('throws ZodError when tags is missing', async () => {
		await expect(updateRecipeTags({ plannerId, recipeId })).rejects.toThrow();
	});

	test('throws ZodError when tags is not an array', async () => {
		await expect(
			updateRecipeTags({ plannerId, recipeId, tags: 'not-an-array' }),
		).rejects.toThrow();
	});

	test('returns Unauthorized error when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthenticated' });

		const result = await updateRecipeTags(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(Planner.collection.updateOne).not.toHaveBeenCalled();
	});

	test('returns Unauthorized error when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthorized' });

		const result = await updateRecipeTags(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
	});

	test('returns Recipe not found error when matchedCount is 0', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 0,
		} as never);

		const result = await updateRecipeTags(validData);

		expect(result).toEqual({ ok: false, error: 'Recipe not found' });
	});

	test('sets tags as ObjectIds on success', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		await updateRecipeTags(validData);

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.objectContaining({ 'saved._id': expect.any(Types.ObjectId) }),
			{ $set: { 'saved.$.tags': [expect.any(Types.ObjectId)] } },
		);
	});

	test('sets empty tags array when tags is empty', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		await updateRecipeTags({ plannerId, recipeId, tags: [] });

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.objectContaining({ 'saved._id': expect.any(Types.ObjectId) }),
			{ $set: { 'saved.$.tags': [] } },
		);
	});

	test('revalidates the recipe path on success', async () => {
		const { revalidatePath } = await import('next/cache');
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		await updateRecipeTags(validData);

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

		const result = await updateRecipeTags(validData);

		expect(result).toEqual({ ok: false, error: 'Recipe not found' });
		expect(revalidatePath).not.toHaveBeenCalled();
	});

	test('returns ok on success', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		const result = await updateRecipeTags(validData);

		expect(result).toEqual({ ok: true, data: undefined });
	});
});
