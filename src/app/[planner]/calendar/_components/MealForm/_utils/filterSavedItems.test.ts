import { describe, expect, it } from 'vitest';

import type { SavedItem } from '@/_actions/library/types';
import type { TagInterface } from '@/_models/types';

import { filterSavedItems } from './filterSavedItems';

const quick: TagInterface = { _id: 'quick', name: 'Quick', color: 'fern' };
const vegetarian: TagInterface = {
	_id: 'vegetarian',
	name: 'Vegetarian',
	color: 'steel',
};

const item = (name: string, tags: TagInterface[] = []): SavedItem => ({
	_id: name,
	name,
	kind: 'recipe',
	tags,
});

const tacos = item('Black Bean Tacos', [quick, vegetarian]);
const risotto = item('Mushroom Risotto', [vegetarian]);
const chicken = item('Lemon Herb Chicken');
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
