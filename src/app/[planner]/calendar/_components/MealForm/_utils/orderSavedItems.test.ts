import { describe, expect, it } from 'vitest';

import type { SavedItem } from '@/_actions/library/types';

import { orderSavedItems } from './orderSavedItems';

const item = (name: string): SavedItem => ({
	_id: name,
	name,
	kind: 'recipe',
	tags: [],
});

describe('orderSavedItems', () => {
	it('orders saved items by name, ignoring case', () => {
		const ordered = orderSavedItems([
			item('Overnight Oats'),
			item('black Bean Tacos'),
			item('Lemon Herb Chicken'),
		]);

		expect(ordered.map((saved) => saved.name)).toEqual([
			'black Bean Tacos',
			'Lemon Herb Chicken',
			'Overnight Oats',
		]);
	});
});
