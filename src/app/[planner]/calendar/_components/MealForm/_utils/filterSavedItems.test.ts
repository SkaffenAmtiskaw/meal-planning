import { describe, expect, it } from 'vitest';

import { makeSavedItem } from '#fixtures/savedItem';
import type { TagInterface } from '@/_models/types';

import { filterSavedItems } from './filterSavedItems';

const quick: TagInterface = { _id: 'quick', name: 'Quick', color: 'fern' };
const vegetarian: TagInterface = {
	_id: 'vegetarian',
	name: 'Vegetarian',
	color: 'steel',
};

const tacos = makeSavedItem({
	name: 'Black Bean Tacos',
	tags: [quick, vegetarian],
});
const risotto = makeSavedItem({ name: 'Mushroom Risotto', tags: [vegetarian] });
const chicken = makeSavedItem({ name: 'Lemon Herb Chicken' });
const savedItems = [tacos, risotto, chicken];

describe('filterSavedItems', () => {
	it('keeps the items whose name holds the search anywhere, ignoring case', () => {
		expect(
			filterSavedItems(savedItems, { search: 'TACO', tagIds: [] }),
		).toEqual([tacos]);
	});

	it('keeps every item while the search is empty or only spaces and no tags are selected', () => {
		expect(filterSavedItems(savedItems, { search: '  ', tagIds: [] })).toEqual(
			savedItems,
		);
	});

	it('keeps only the items that carry every selected tag', () => {
		expect(
			filterSavedItems(savedItems, {
				search: '',
				tagIds: ['vegetarian', 'quick'],
			}),
		).toEqual([tacos]);
	});

	it('keeps only the items that match both the search and the selected tags', () => {
		expect(
			filterSavedItems(savedItems, {
				search: 'risotto',
				tagIds: ['quick'],
			}),
		).toEqual([]);
	});
});
