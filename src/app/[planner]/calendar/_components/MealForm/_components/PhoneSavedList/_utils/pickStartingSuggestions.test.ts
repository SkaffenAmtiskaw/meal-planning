import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeSavedItem } from '#fixtures/savedItem';
import type { SavedItem } from '@/_actions/library/types';

import { hasBeenUsed } from './hasBeenUsed';
import { pickStartingSuggestions } from './pickStartingSuggestions';

import { orderByRecentUse } from '../../../_utils/orderByRecentUse';

vi.mock('../../../_utils/orderByRecentUse', () => ({
	orderByRecentUse: vi.fn(() => []),
}));
vi.mock('./hasBeenUsed', () => ({
	hasBeenUsed: vi.fn(() => false),
}));

const items = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((name) =>
	makeSavedItem({ name }),
);
const [a, b, c, d, e, f, g] = items;

// The given items count as used, and the order puts the items in the order given.
const withOrder = (ordered: SavedItem[], used: SavedItem[]) => {
	vi.mocked(orderByRecentUse).mockReturnValue(ordered);
	vi.mocked(hasBeenUsed).mockImplementation((item) => used.includes(item));
};

describe('pickStartingSuggestions', () => {
	beforeEach(() => {
		vi.mocked(hasBeenUsed).mockReset();
	});

	it('orders the items itself', () => {
		withOrder([], []);

		pickStartingSuggestions([g, a]);

		expect(orderByRecentUse).toHaveBeenCalledWith([g, a]);
	});

	it('lists only the used items, in order, when fewer than 5 have been used', () => {
		withOrder([c, a, b, d], [c, a]);

		expect(pickStartingSuggestions(items)).toEqual([c, a]);
	});

	it('lists the first 5 used items when more than 5 have been used', () => {
		withOrder([g, f, e, d, c, b, a], items);

		expect(pickStartingSuggestions(items)).toEqual([g, f, e, d, c]);
	});

	it('lists the first 5 items when none have been used', () => {
		withOrder(items, []);

		expect(pickStartingSuggestions(items)).toEqual([a, b, c, d, e]);
	});
});
