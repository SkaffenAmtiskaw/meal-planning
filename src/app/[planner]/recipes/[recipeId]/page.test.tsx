import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notFound } from 'next/navigation';

import { getPlanner } from '@/_actions/planner';

import RecipePage from './page';

import { RecipeDetail } from './_components/RecipeDetail';
import { RecipeEditForm } from './_components/RecipeEditForm';

vi.mock(
	'@/_actions/planner',
	async () => await import('#mocks/@/_actions/planner'),
);

vi.mock('next/navigation', async () => await import('#mocks/next/navigation'));

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock('./_components/RecipeDetail', () => ({
	RecipeDetail: vi.fn(() => null),
}));

vi.mock('./_components/RecipeEditForm', () => ({
	RecipeEditForm: vi.fn(() => null),
}));

const plannerId = '507f1f77bcf86cd799439011';
const recipeId = '507f1f77bcf86cd799439012';

const tags = [{ _id: 'tag-1', name: 'Spicy', color: 'red' }];

const makeRecipe = (overrides = {}) => ({
	_id: recipeId,
	name: "Maleficent's Dragon Roast",
	ingredients: ['dragon scales'],
	instructions: ['heat cauldron'],
	...overrides,
});

const makePlanner = (saved: unknown[] = []) => ({
	_id: plannerId,
	saved,
	tags: [],
});

describe('RecipePage', () => {
	const params = Promise.resolve({ planner: plannerId, recipeId });
	const searchParams = Promise.resolve({});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders RecipeDetail with the recipe when found', async () => {
		const recipe = makeRecipe();
		vi.mocked(getPlanner).mockResolvedValueOnce(makePlanner([recipe]) as never);

		render(await RecipePage({ params, searchParams }));

		expect(vi.mocked(RecipeDetail)).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId,
				recipe: expect.objectContaining({
					name: "Maleficent's Dragon Roast",
				}),
			}),
			undefined,
		);
		expect(vi.mocked(RecipeEditForm)).not.toHaveBeenCalled();
	});

	it("passes the planner's tags to RecipeDetail", async () => {
		const recipe = makeRecipe();
		const planner = { ...makePlanner([recipe]), tags };
		vi.mocked(getPlanner).mockResolvedValueOnce(planner as never);

		render(await RecipePage({ params, searchParams }));

		expect(vi.mocked(RecipeDetail)).toHaveBeenCalledWith(
			expect.objectContaining({ tags }),
			undefined,
		);
	});

	it('calls notFound when item is not in saved', async () => {
		vi.mocked(getPlanner).mockResolvedValueOnce(makePlanner([]) as never);

		await RecipePage({ params, searchParams });

		expect(vi.mocked(notFound)).toHaveBeenCalled();
	});

	it('calls notFound when item is a bookmark', async () => {
		const bookmark = {
			_id: recipeId,
			name: 'Some Bookmark',
			url: 'https://example.com',
		};
		vi.mocked(getPlanner).mockResolvedValueOnce(
			makePlanner([bookmark]) as never,
		);

		await RecipePage({ params, searchParams });

		expect(vi.mocked(notFound)).toHaveBeenCalled();
	});

	it('renders RecipeEditForm when status is edit', async () => {
		const recipe = makeRecipe();
		vi.mocked(getPlanner).mockResolvedValueOnce(makePlanner([recipe]) as never);

		render(
			await RecipePage({
				params,
				searchParams: Promise.resolve({ status: 'edit' }),
			}),
		);

		expect(vi.mocked(RecipeEditForm)).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId,
				recipe: expect.objectContaining({
					name: "Maleficent's Dragon Roast",
				}),
			}),
			undefined,
		);
		expect(vi.mocked(RecipeDetail)).not.toHaveBeenCalled();
	});

	it("passes the planner's tags to RecipeEditForm in edit mode", async () => {
		const recipe = makeRecipe();
		const planner = { ...makePlanner([recipe]), tags };
		vi.mocked(getPlanner).mockResolvedValueOnce(planner as never);

		render(
			await RecipePage({
				params,
				searchParams: Promise.resolve({ status: 'edit' }),
			}),
		);

		expect(vi.mocked(RecipeEditForm)).toHaveBeenCalledWith(
			expect.objectContaining({ tags }),
			undefined,
		);
	});
});
