import { describe, expect, it } from 'vitest';

import type { SavedItem } from '@/_actions/library/types';

import { filterSavedItems } from './filterSavedItems';

const item = (name: string): SavedItem => ({
	_id: name,
	name,
	kind: 'recipe',
	tags: [],
});

const savedItems = [item('Black Bean Tacos'), item('Lemon Herb Chicken')];

describe('filterSavedItems', () => {
	it('keeps the items whose name holds the search anywhere, ignoring case', () => {
		expect(
			filterSavedItems(savedItems, { search: 'TACO', tagIds: [] }),
		).toEqual([item('Black Bean Tacos')]);
	});

	it('keeps every item while the search is empty or only spaces', () => {
		expect(filterSavedItems(savedItems, { search: '  ', tagIds: [] })).toEqual(
			savedItems,
		);
	});
});
