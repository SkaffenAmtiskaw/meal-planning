import { describe, expect, test } from 'vitest';

import type { DishInterface } from '@/_models/types';

import { resolveDishSource } from './resolveDishSource';
import type { SavedItem } from './toScheduleXEvents';

describe('resolveDishSource', () => {
	const makeMap = (items: SavedItem[]) =>
		new Map(items.map((item) => [item._id, item]));

	test('resolves string source with url to url object', () => {
		const dish: DishInterface = {
			_id: 'dish-1',
			name: 'Pasta',
			source: 'saved-1',
		};
		const savedMap = makeMap([
			{ _id: 'saved-1', name: 'My Bookmark', url: 'https://example.com' },
		]);
		expect(resolveDishSource(dish, savedMap)).toEqual({
			_id: 'dish-1',
			name: 'Pasta',
			source: { url: 'https://example.com' },
		});
	});

	test('resolves string source without url to _id object', () => {
		const dish: DishInterface = {
			_id: 'dish-1',
			name: 'Pasta',
			source: 'saved-1',
		};
		const savedMap = makeMap([{ _id: 'saved-1', name: 'My Recipe' }]);
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
		const savedMap = makeMap([{ _id: 'saved-99', name: 'Other' }]);
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
