import { notFound } from 'next/navigation';

import { render } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import RecipePage from './page';

import { RecipeForm } from '../_components/Modal/RecipeForm';
import { RecipeDetail } from './_components/RecipeDetail';

vi.mock('@/_models', async () => {
	const { zObjectId } = await import('@/_models/utils/zObjectId');
	const { matchesId } = await import('@/_models/utils/matchesId');
	return { zObjectId, matchesId };
});

const mockGetPlanner = vi.fn();
vi.mock('@/_actions/planner', () => ({
	getPlanner: (...args: unknown[]) => mockGetPlanner(...args),
}));

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock('./_components/RecipeDetail', () => ({
	RecipeDetail: vi.fn(() => null),
}));

vi.mock('../_components/Modal/RecipeForm', () => ({
	RecipeForm: vi.fn(() => null),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const plannerId = '507f1f77bcf86cd799439011';
const recipeId = '507f1f77bcf86cd799439012';

const makeRecipe = (overrides = {}) => ({
	_id: { toString: () => recipeId },
	name: "Maleficent's Dragon Roast",
	ingredients: ['dragon scales'],
	instructions: ['heat cauldron'],
	...overrides,
});

const makePlanner = (saved: unknown[] = []) => ({
	_id: { toString: () => plannerId },
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
		mockGetPlanner.mockResolvedValue(makePlanner([recipe]));

		render(await RecipePage({ params, searchParams }));

		expect(vi.mocked(RecipeDetail)).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId,
				recipe: expect.objectContaining({ name: "Maleficent's Dragon Roast" }),
			}),
			undefined,
		);
	});

	it('passes resolved tags to RecipeDetail', async () => {
		const recipe = makeRecipe();
		const planner = {
			...makePlanner([recipe]),
			tags: [{ _id: { toString: () => 'tag-1' }, name: 'Spicy', color: 'red' }],
		};
		mockGetPlanner.mockResolvedValue(planner);

		render(await RecipePage({ params, searchParams }));

		expect(vi.mocked(RecipeDetail)).toHaveBeenCalledWith(
			expect.objectContaining({
				tags: [{ _id: 'tag-1', name: 'Spicy', color: 'red' }],
			}),
			undefined,
		);
	});

	it('calls notFound when item is not in saved', async () => {
		mockGetPlanner.mockResolvedValue(makePlanner([]));

		await RecipePage({ params, searchParams });

		expect(vi.mocked(notFound)).toHaveBeenCalled();
	});

	it('calls notFound when item is a bookmark', async () => {
		const bookmark = {
			_id: { toString: () => recipeId },
			name: 'Some Bookmark',
			url: 'https://example.com',
		};
		mockGetPlanner.mockResolvedValue(makePlanner([bookmark]));

		await RecipePage({ params, searchParams });

		expect(vi.mocked(notFound)).toHaveBeenCalled();
	});

	it('throws ZodError for invalid planner ID', async () => {
		const badParams = Promise.resolve({ planner: 'not-an-id', recipeId });
		await expect(
			RecipePage({ params: badParams, searchParams }),
		).rejects.toThrow();
	});

	it('throws ZodError for invalid recipe ID', async () => {
		const badParams = Promise.resolve({ planner: plannerId, recipeId: 'bad' });
		await expect(
			RecipePage({ params: badParams, searchParams }),
		).rejects.toThrow();
	});

	it('renders RecipeForm when status=edit', async () => {
		const recipe = makeRecipe();
		mockGetPlanner.mockResolvedValue(makePlanner([recipe]));

		render(
			await RecipePage({
				params,
				searchParams: Promise.resolve({ status: 'edit' }),
			}),
		);

		expect(vi.mocked(RecipeForm)).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId,
				item: expect.objectContaining({ name: "Maleficent's Dragon Roast" }),
				redirectTo: `/${plannerId}/recipes/${recipeId}`,
			}),
			undefined,
		);
		expect(vi.mocked(RecipeDetail)).not.toHaveBeenCalled();
	});

	it('renders RecipeDetail (not RecipeForm) when no status', async () => {
		const recipe = makeRecipe();
		mockGetPlanner.mockResolvedValue(makePlanner([recipe]));

		render(await RecipePage({ params, searchParams }));

		expect(vi.mocked(RecipeDetail)).toHaveBeenCalled();
		expect(vi.mocked(RecipeForm)).not.toHaveBeenCalled();
	});

	it('passes tags to RecipeForm in edit mode', async () => {
		const recipe = makeRecipe();
		const planner = {
			...makePlanner([recipe]),
			tags: [{ _id: { toString: () => 'tag-1' }, name: 'Spicy', color: 'red' }],
		};
		mockGetPlanner.mockResolvedValue(planner);

		render(
			await RecipePage({
				params,
				searchParams: Promise.resolve({ status: 'edit' }),
			}),
		);

		expect(vi.mocked(RecipeForm)).toHaveBeenCalledWith(
			expect.objectContaining({
				tags: [{ _id: 'tag-1', name: 'Spicy', color: 'red' }],
			}),
			undefined,
		);
	});
});
