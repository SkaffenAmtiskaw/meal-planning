import { describe, expect, test } from 'vitest';

import type { TagInterface } from '@/_models/types';

import { resolveTags } from './resolveTags';

const vegetarian: TagInterface = {
	_id: '507f1f77bcf86cd799439020',
	name: 'Vegetarian',
	color: 'fern',
};
const quick: TagInterface = {
	_id: '507f1f77bcf86cd799439021',
	name: 'Quick',
	color: 'steel',
};

describe('resolveTags', () => {
	test('returns the tags for the given ids, in the order of the ids', () => {
		expect(
			resolveTags([quick._id, vegetarian._id], [vegetarian, quick]),
		).toEqual([quick, vegetarian]);
	});

	test('drops ids that match no tag', () => {
		expect(
			resolveTags(['507f1f77bcf86cd799439099', vegetarian._id], [vegetarian]),
		).toEqual([vegetarian]);
	});

	test('returns no tags when the item has no tag ids', () => {
		expect(resolveTags(undefined, [vegetarian])).toEqual([]);
	});
});
