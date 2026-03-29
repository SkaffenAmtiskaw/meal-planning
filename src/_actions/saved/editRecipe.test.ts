import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';

import { editRecipe } from './editRecipe';

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

const validData = {
	plannerId,
	_id: recipeId,
	name: 'Croissant',
	ingredients: ['2 cups flour', '1 stick butter'],
	instructions: ['Mix ingredients', 'Bake at 400°F'],
};

describe('editRecipe', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('throws ZodError on invalid input', async () => {
		await expect(editRecipe({})).rejects.toThrow();
	});

	test('throws ZodError when _id is missing', async () => {
		const { _id: _, ...withoutId } = validData;
		await expect(editRecipe(withoutId)).rejects.toThrow();
	});

	test('throws ZodError when name is empty string', async () => {
		await expect(editRecipe({ ...validData, name: '' })).rejects.toThrow();
	});

	test('throws ZodError when ingredients is missing', async () => {
		await expect(
			editRecipe({ ...validData, ingredients: undefined }),
		).rejects.toThrow();
	});

	test('returns Unauthorized error when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthenticated' });

		const result = await editRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(Planner.collection.updateOne).not.toHaveBeenCalled();
	});

	test('returns Unauthorized error when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthorized' });

		const result = await editRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
	});

	test('returns Recipe not found error when matchedCount is 0', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 0,
		} as never);

		const result = await editRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Recipe not found' });
	});

	test('always $sets required fields', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		await editRecipe(validData);

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.objectContaining({
				_id: expect.any(Types.ObjectId),
				'saved._id': expect.any(Types.ObjectId),
			}),
			expect.objectContaining({
				$set: expect.objectContaining({
					'saved.$.name': 'Croissant',
					'saved.$.ingredients': validData.ingredients,
					'saved.$.instructions': validData.instructions,
					'saved.$.tags': [],
				}),
			}),
		);
	});

	test('$unsets all optional fields when absent', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		await editRecipe(validData);

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				$unset: {
					'saved.$.source': '',
					'saved.$.time': '',
					'saved.$.servings': '',
					'saved.$.notes': '',
					'saved.$.storage': '',
				},
			}),
		);
	});

	test('$sets optional fields when present', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		const tagId = new Types.ObjectId().toString();
		await editRecipe({
			...validData,
			source: { name: 'Bakery Blog', url: 'https://example.com' },
			time: { prep: '30m', cook: '20m', total: '50m', actual: '55m' },
			servings: 12,
			notes: 'Best served warm',
			storage: 'Room temp up to 2 days',
			tags: [tagId],
		});

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				$set: expect.objectContaining({
					'saved.$.source': { name: 'Bakery Blog', url: 'https://example.com' },
					'saved.$.time': {
						prep: '30m',
						cook: '20m',
						total: '50m',
						actual: '55m',
					},
					'saved.$.servings': 12,
					'saved.$.notes': 'Best served warm',
					'saved.$.storage': 'Room temp up to 2 days',
					'saved.$.tags': [expect.any(Types.ObjectId)],
				}),
			}),
		);
	});

	test('does not include $unset when all optional fields are present', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		await editRecipe({
			...validData,
			source: { name: 'Blog' },
			time: { prep: '10m' },
			servings: 2,
			notes: 'Tasty',
			storage: '3 days',
		});

		const call = vi.mocked(Planner.collection.updateOne).mock
			.calls[0][1] as Record<string, unknown>;
		expect(call.$unset).toBeUndefined();
	});

	test('revalidates both list and detail paths on success', async () => {
		const { revalidatePath } = await import('next/cache');
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		await editRecipe(validData);

		expect(revalidatePath).toHaveBeenCalledWith(`/${plannerId}/recipes`);
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

		await editRecipe(validData);

		expect(revalidatePath).not.toHaveBeenCalled();
	});

	test('returns _id and name on success', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		const result = await editRecipe(validData);

		expect(result).toEqual({
			ok: true,
			data: { _id: recipeId, name: 'Croissant' },
		});
	});
});
