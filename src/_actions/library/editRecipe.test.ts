import { beforeEach, describe, expect, it, vi } from 'vitest';

import { plannerCache } from '@/_actions/_utils/caches';
import { invalidate } from '@/_actions/_utils/invalidate';
import { checkAuth } from '@/_actions/auth/checkAuth';
import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';

import { editRecipe } from './editRecipe';

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
vi.mock('./_utils/transformRecipeForm', async () => ({
	transformRecipeForm: vi.fn((data) => data),
}));

const plannerId = newId();
const recipeId = newId();

const validData = {
	plannerId,
	_id: recipeId,
	name: 'Croissant',
	ingredients: ['2 cups flour', '1 stick butter'],
	instructions: ['Mix ingredients', 'Bake at 400°F'],
};

describe('editRecipe', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("checks write access to the recipe's planner", async () => {
		await editRecipe(validData);

		expect(checkAuth).toHaveBeenCalledWith(plannerId, 'write');
	});

	describe('database update', () => {
		it('returns Recipe not found when no document matches', async () => {
			vi.mocked(planners.updateOne).mockResolvedValueOnce({
				matchedCount: 0,
			} as never);

			const result = await editRecipe(validData);

			expect(result).toEqual({ ok: false, error: 'Recipe not found' });
		});

		it('sets required fields on the matched recipe', async () => {
			await editRecipe(validData);

			expect(planners.updateOne).toHaveBeenCalledWith(
				expect.objectContaining({
					_id: plannerId,
					'saved._id': recipeId,
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
			await editRecipe(validData);

			expect(planners.updateOne).toHaveBeenCalledWith(
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
			const tagId = newId();
			await editRecipe({
				...validData,
				source: { name: 'Bakery Blog', url: 'https://example.com' },
				time: { prep: '30m', cook: '20m', total: '50m', actual: '55m' },
				servings: 12,
				notes: 'Best served warm',
				storage: 'Room temp up to 2 days',
				tags: [tagId],
			});

			expect(planners.updateOne).toHaveBeenCalledWith(
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
						'saved.$.tags': [tagId],
					}),
				}),
			);
		});

		it('only unsets optional fields that are absent', async () => {
			await editRecipe({
				...validData,
				source: { name: 'Bakery Blog' },
				notes: 'Best served warm',
			});

			expect(planners.updateOne).toHaveBeenCalledWith(
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
			await editRecipe({
				...validData,
				source: { name: 'Blog' },
				time: { prep: '10m' },
				servings: 2,
				notes: 'Tasty',
				storage: '3 days',
			});

			const call = vi.mocked(planners.updateOne).mock.calls[0][1] as Record<
				string,
				unknown
			>;
			expect(call.$unset).toBeUndefined();
		});

		it('writes only the fields the form edits, so the last-used date stays as it was', async () => {
			await editRecipe(validData);

			const update = vi.mocked(planners.updateOne).mock.calls[0][1] as {
				$set: Record<string, unknown>;
				$unset?: Record<string, unknown>;
			};
			expect(
				[
					...Object.keys(update.$set),
					...Object.keys(update.$unset ?? {}),
				].sort(),
			).toEqual(
				[
					'saved.$.name',
					'saved.$.ingredients',
					'saved.$.instructions',
					'saved.$.tags',
					'saved.$.source',
					'saved.$.time',
					'saved.$.servings',
					'saved.$.notes',
					'saved.$.storage',
				].sort(),
			);
		});
	});

	describe('success', () => {
		it('returns the recipe _id and name', async () => {
			const result = await editRecipe(validData);

			expect(result).toEqual({
				ok: true,
				data: { _id: recipeId, name: 'Croissant' },
			});
		});
	});

	it("invalidates the planner's saved items", async () => {
		await editRecipe(validData);

		expect(invalidate).toHaveBeenCalledWith([plannerCache.saved(plannerId)]);
	});
});
