import { render } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import RecipePage from './page';

vi.mock('@/_models', async () => {
	const { zObjectId } = await import('@/_models/_utils/zObjectId');
	return { zObjectId };
});

const mockGetPlanner = vi.fn();
vi.mock('@/_actions', () => ({
	getPlanner: (...args: unknown[]) => mockGetPlanner(...args),
}));

const mockNotFound = vi.fn(() => {
	throw new Error('NEXT_NOT_FOUND');
});
vi.mock('next/navigation', () => ({
	notFound: () => mockNotFound(),
}));

type RecipeDetailProps = {
	plannerId: string;
	recipe: unknown;
	tags: unknown[];
};

const mockRecipeDetail = vi.fn<(props: RecipeDetailProps) => null>(() => null);
vi.mock('./_components/RecipeDetail', () => ({
	RecipeDetail: (props: RecipeDetailProps) => mockRecipeDetail(props),
}));

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

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders RecipeDetail with the recipe when found', async () => {
		const recipe = makeRecipe();
		mockGetPlanner.mockResolvedValue(makePlanner([recipe]));

		render(await RecipePage({ params }));

		expect(mockRecipeDetail).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId,
				recipe: expect.objectContaining({ name: "Maleficent's Dragon Roast" }),
			}),
		);
	});

	test('passes resolved tags to RecipeDetail', async () => {
		const recipe = makeRecipe();
		const planner = {
			...makePlanner([recipe]),
			tags: [{ _id: { toString: () => 'tag-1' }, name: 'Spicy', color: 'red' }],
		};
		mockGetPlanner.mockResolvedValue(planner);

		render(await RecipePage({ params }));

		expect(mockRecipeDetail).toHaveBeenCalledWith(
			expect.objectContaining({
				tags: [{ _id: 'tag-1', name: 'Spicy', color: 'red' }],
			}),
		);
	});

	test('calls notFound when item is not in saved', async () => {
		mockGetPlanner.mockResolvedValue(makePlanner([]));

		await expect(RecipePage({ params })).rejects.toThrow('NEXT_NOT_FOUND');
		expect(mockNotFound).toHaveBeenCalled();
	});

	test('calls notFound when item is a bookmark', async () => {
		const bookmark = {
			_id: { toString: () => recipeId },
			name: 'Some Bookmark',
			url: 'https://example.com',
		};
		mockGetPlanner.mockResolvedValue(makePlanner([bookmark]));

		await expect(RecipePage({ params })).rejects.toThrow('NEXT_NOT_FOUND');
		expect(mockNotFound).toHaveBeenCalled();
	});

	test('throws ZodError for invalid planner ID', async () => {
		const badParams = Promise.resolve({ planner: 'not-an-id', recipeId });
		await expect(RecipePage({ params: badParams })).rejects.toThrow();
	});

	test('throws ZodError for invalid recipe ID', async () => {
		const badParams = Promise.resolve({ planner: plannerId, recipeId: 'bad' });
		await expect(RecipePage({ params: badParams })).rejects.toThrow();
	});
});
