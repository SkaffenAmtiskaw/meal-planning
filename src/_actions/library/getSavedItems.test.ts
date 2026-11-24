import { afterEach, describe, expect, test, vi } from 'vitest';

import { resolveTags } from '@/_actions/library/resolveTags';
import { getPlanner } from '@/_actions/planner/getPlanner';
import type { TagInterface } from '@/_models/types';

import { getSavedItems } from './getSavedItems';

vi.mock(
	'@/_actions/planner/getPlanner',
	async () => await import('#mocks/@/_actions/planner/getPlanner'),
);
vi.mock('@/_actions/library/resolveTags', () => ({
	resolveTags: vi.fn(() => []),
}));

const plannerId = '507f1f77bcf86cd799439011';

const quick: TagInterface = {
	_id: '507f1f77bcf86cd799439020',
	name: 'Quick',
	color: 'fern',
};

const recipe = {
	_id: '507f1f77bcf86cd799439012',
	name: 'Lemon Herb Chicken',
	ingredients: ['1 lemon'],
	instructions: ['Roast.'],
	tags: [quick._id],
};

const bookmark = {
	_id: '507f1f77bcf86cd799439013',
	name: 'Weeknight Pasta Ideas',
	url: 'https://example.com/pasta',
	tags: [quick._id],
	notes: 'Try the third one',
};

const plannerWith = (saved: object[]) =>
	vi.mocked(getPlanner).mockResolvedValueOnce({
		_id: plannerId,
		name: "Test User's Planner",
		calendar: [],
		saved,
		tags: [quick],
	} as never);

describe('getSavedItems', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test("reads the planner through getPlanner, which checks the user's read access", async () => {
		await getSavedItems(plannerId);

		expect(getPlanner).toHaveBeenCalledWith(plannerId);
	});

	test('gives a recipe the recipe kind and none of its other fields', async () => {
		plannerWith([recipe]);

		expect(await getSavedItems(plannerId)).toEqual([
			{ _id: recipe._id, name: recipe.name, kind: 'recipe', tags: [] },
		]);
	});

	test('gives a bookmark the bookmark kind and its url', async () => {
		plannerWith([bookmark]);

		expect(await getSavedItems(plannerId)).toEqual([
			{
				_id: bookmark._id,
				name: bookmark.name,
				kind: 'bookmark',
				url: bookmark.url,
				tags: [],
			},
		]);
	});

	test("resolves each item's tags against the planner's tags", async () => {
		plannerWith([recipe]);
		vi.mocked(resolveTags).mockReturnValueOnce([quick]);

		const [item] = await getSavedItems(plannerId);

		expect(resolveTags).toHaveBeenCalledWith(recipe.tags, [quick]);
		expect(item.tags).toEqual([quick]);
	});
});
