import { describe, expect, it } from 'vitest';

import { makeSavedItem } from '#fixtures/savedItem';

import { orderSavedItems } from './orderSavedItems';

describe('orderSavedItems', () => {
	it('orders saved items by name, ignoring case', () => {
		const ordered = orderSavedItems([
			makeSavedItem({ name: 'Overnight Oats' }),
			makeSavedItem({ name: 'black Bean Tacos' }),
			makeSavedItem({ name: 'Lemon Herb Chicken' }),
		]);

		expect(ordered.map((saved) => saved.name)).toEqual([
			'black Bean Tacos',
			'Lemon Herb Chicken',
			'Overnight Oats',
		]);
	});
});
