import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeSavedItem } from '#fixtures/savedItem';
import type { SavedItem } from '@/_actions/library/types';

import { pickStartingSuggestions } from './pickStartingSuggestions';

import { hasBeenUsed } from '../../../_utils/hasBeenUsed';

vi.mock('../../../_utils/hasBeenUsed', () => ({
	hasBeenUsed: vi.fn(() => false),
}));

const items = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((name) =>
	makeSavedItem({ name }),
);
const [a, b, c, d, e, f, g] = items;

const usedAre = (used: SavedItem[]) => {
	vi.mocked(hasBeenUsed).mockImplementation((item) => used.includes(item));
};

describe('pickStartingSuggestions', () => {
	beforeEach(() => {
		vi.mocked(hasBeenUsed).mockReset();
	});

	it('lists only the used items, in the order given, when fewer than 5 have been used', () => {
		usedAre([c, a]);

		expect(pickStartingSuggestions([c, a, b, d])).toEqual([c, a]);
	});

	it('lists the first 5 used items when more than 5 have been used', () => {
		usedAre(items);

		expect(pickStartingSuggestions([g, f, e, d, c, b, a])).toEqual([
			g,
			f,
			e,
			d,
			c,
		]);
	});

	it('lists the first 5 items given when none have been used', () => {
		usedAre([]);

		expect(pickStartingSuggestions(items)).toEqual([a, b, c, d, e]);
	});
});
