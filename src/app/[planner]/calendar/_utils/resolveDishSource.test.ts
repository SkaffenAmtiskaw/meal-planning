import { describe, expect, test } from 'vitest';

import type { SavedItem } from '@/_actions/library/types';
import type { DishInterface } from '@/_models/types';

import { resolveDishSource } from './resolveDishSource';

describe('resolveDishSource', () => {
	const makeMap = (items: SavedItem[]) =>
		new Map(items.map((item) => [item._id, item]));

	test("resolves a bookmark's id to its url", () => {
		const dish: DishInterface = {
			_id: 'dish-1',
			name: 'Pasta',
			source: 'saved-1',
		};
		const savedMap = makeMap([
			{
				_id: 'saved-1',
				name: 'My Bookmark',
				kind: 'bookmark',
				url: 'https://example.com',
				tags: [],
			},
		]);
		expect(resolveDishSource(dish, savedMap)).toEqual({
			_id: 'dish-1',
			name: 'Pasta',
			source: { url: 'https://example.com' },
		});
	});

	test("resolves a recipe's id to an _id object", () => {
		const dish: DishInterface = {
			_id: 'dish-1',
			name: 'Pasta',
			source: 'saved-1',
		};
		const savedMap = makeMap([
			{ _id: 'saved-1', name: 'My Recipe', kind: 'recipe', tags: [] },
		]);
		expect(resolveDishSource(dish, savedMap)).toEqual({
			_id: 'dish-1',
			name: 'Pasta',
			source: { _id: 'saved-1' },
		});
	});

	test('returns dish unchanged when string source not found in map', () => {
		const dish: DishInterface = {
			_id: 'dish-1',
			name: 'Pasta',
			source: 'unknown-id',
		};
		const savedMap = makeMap([
			{ _id: 'saved-99', name: 'Other', kind: 'recipe', tags: [] },
		]);
		expect(resolveDishSource(dish, savedMap)).toBe(dish);
	});

	test('returns dish unchanged when source is not a string', () => {
		const dish: DishInterface = {
			_id: 'dish-1',
			name: 'Pasta',
			source: { url: 'https://example.com' },
		};
		const savedMap = makeMap([]);
		expect(resolveDishSource(dish, savedMap)).toBe(dish);
	});
});
