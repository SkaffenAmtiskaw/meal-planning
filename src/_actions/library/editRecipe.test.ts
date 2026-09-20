import { revalidatePath } from 'next/cache';

import { Types } from 'mongoose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth';
import { zRecipeFormSchema } from '@/_models/library';
import { Planner } from '@/_models/planner';

import { editRecipe } from './editRecipe';

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));
vi.mock(
	'@/_models/library',
	async () => await import('@mocks/@/_models/library'),
);
vi.mock(
	'@/_models/planner',
	async () => await import('@mocks/@/_models/planner'),
);
vi.mock('next/cache', async () => ({ revalidatePath: vi.fn() }));
vi.mock('./_utils/transformRecipeForm', async () => ({
	transformRecipeForm: vi.fn((data) => data),
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

	beforeEach(() => {
		vi.mocked(zRecipeFormSchema.parse).mockImplementation(
			(data) => data as never,
		);
	});

	describe('input validation', () => {
		it('throws when input fails schema validation', async () => {
			vi.mocked(zRecipeFormSchema.parse).mockImplementationOnce(() => {
				throw new Error('Validation failed');
			});

			await expect(editRecipe({})).rejects.toThrow('Validation failed');
		});

		it('throws when _id is missing', async () => {
			vi.mocked(zRecipeFormSchema.parse).mockImplementationOnce(() => {
				throw new Error('Validation failed');
			});

			const { _id: _, ...withoutId } = validData;
			await expect(editRecipe(withoutId)).rejects.toThrow('Validation failed');
		});
	});

	describe('authorization', () => {
		it('returns Unauthorized when the session is missing', async () => {
			vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthenticated' });

			const result = await editRecipe(validData);

			expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		});

		it('returns Unauthorized when the user lacks write access', async () => {
			vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthorized' });

			const result = await editRecipe(validData);

			expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		});

		it('does not update the database when auth fails', async () => {
			vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthenticated' });

			await editRecipe(validData);

			expect(Planner.collection.updateOne).not.toHaveBeenCalled();
		});
	});

	describe('database update', () => {
		it('returns Recipe not found when no document matches', async () => {
			vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({
				matchedCount: 0,
			} as never);

			const result = await editRecipe(validData);

			expect(result).toEqual({ ok: false, error: 'Recipe not found' });
		});

		it('sets required fields on the matched recipe', async () => {
			vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({
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

		it('unsets optional fields when they are absent', async () => {
			vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({
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

		it('sets optional fields when they are present', async () => {
			vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({
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
						'saved.$.source': {
							name: 'Bakery Blog',
							url: 'https://example.com',
						},
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

		it('only unsets optional fields that are absent', async () => {
			vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({
				matchedCount: 1,
			} as never);

			await editRecipe({
				...validData,
				source: { name: 'Bakery Blog' },
				notes: 'Best served warm',
			});

			expect(Planner.collection.updateOne).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					$set: expect.objectContaining({
						'saved.$.source': { name: 'Bakery Blog' },
						'saved.$.notes': 'Best served warm',
					}),
					$unset: {
						'saved.$.time': '',
						'saved.$.servings': '',
						'saved.$.storage': '',
					},
				}),
			);
		});

		it('omits $unset when all optional fields are present', async () => {
			vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({
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
	});

	describe('cache revalidation', () => {
		it('revalidates the list and detail paths on success', async () => {
			vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({
				matchedCount: 1,
			} as never);

			await editRecipe(validData);

			expect(revalidatePath).toHaveBeenCalledWith(`/${plannerId}/recipes`);
			expect(revalidatePath).toHaveBeenCalledWith(
				`/${plannerId}/recipes/${recipeId}`,
			);
		});

		it('does not revalidate when the recipe is not found', async () => {
			vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({
				matchedCount: 0,
			} as never);

			await editRecipe(validData);

			expect(revalidatePath).not.toHaveBeenCalled();
		});
	});

	describe('success', () => {
		it('returns the recipe _id and name', async () => {
			vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({
				matchedCount: 1,
			} as never);

			const result = await editRecipe(validData);

			expect(result).toEqual({
				ok: true,
				data: { _id: recipeId, name: 'Croissant' },
			});
		});
	});
});
