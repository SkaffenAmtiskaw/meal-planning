import { notFound } from 'next/navigation';

import { render } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getPlanner } from '@/_actions/planner';

import RecipePage from './page';

import { RecipeForm } from '../_components/Modal/RecipeForm';
import { RecipeDetail } from './_components/RecipeDetail';

vi.mock('@/_utils/zObjectId', async () => {
	const { z } = await import('zod');
	return {
		zObjectId: z.string(),
	};
});

vi.mock('@/_utils/matchesId', () => ({
	matchesId: vi.fn(
		(id: string) => (item: { _id: { toString: () => string } }) =>
			item._id.toString() === id,
	),
}));

vi.mock(
	'@/_actions/planner',
	async () => await import('@mocks/@/_actions/planner'),
);

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./_components/RecipeDetail', () => ({
	RecipeDetail: vi.fn(() => null),
}));

vi.mock('../_components/Modal/RecipeForm', () => ({
	RecipeForm: vi.fn(() => null),
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
		expect(vi.mocked(RecipeForm)).not.toHaveBeenCalled();
	});

	it('passes resolved tags to RecipeDetail', async () => {
		const recipe = makeRecipe();
		const planner = {
			...makePlanner([recipe]),
			tags: [{ _id: { toString: () => 'tag-1' }, name: 'Spicy', color: 'red' }],
		};
		vi.mocked(getPlanner).mockResolvedValueOnce(planner as never);

		render(await RecipePage({ params, searchParams }));

		expect(vi.mocked(RecipeDetail)).toHaveBeenCalledWith(
			expect.objectContaining({
				tags: [{ _id: 'tag-1', name: 'Spicy', color: 'red' }],
			}),
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
			_id: { toString: () => recipeId },
			name: 'Some Bookmark',
			url: 'https://example.com',
		};
		vi.mocked(getPlanner).mockResolvedValueOnce(
			makePlanner([bookmark]) as never,
		);

		await RecipePage({ params, searchParams });

		expect(vi.mocked(notFound)).toHaveBeenCalled();
	});

	it('renders RecipeForm when status is edit', async () => {
		const recipe = makeRecipe();
		vi.mocked(getPlanner).mockResolvedValueOnce(makePlanner([recipe]) as never);

		render(
			await RecipePage({
				params,
				searchParams: Promise.resolve({ status: 'edit' }),
			}),
		);

		expect(vi.mocked(RecipeForm)).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId,
				item: expect.objectContaining({
					name: "Maleficent's Dragon Roast",
				}),
				redirectTo: `/${plannerId}/recipes/${recipeId}`,
			}),
			undefined,
		);
		expect(vi.mocked(RecipeDetail)).not.toHaveBeenCalled();
	});

	it('passes tags to RecipeForm in edit mode', async () => {
		const recipe = makeRecipe();
		const planner = {
			...makePlanner([recipe]),
			tags: [{ _id: { toString: () => 'tag-1' }, name: 'Spicy', color: 'red' }],
		};
		vi.mocked(getPlanner).mockResolvedValueOnce(planner as never);

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
