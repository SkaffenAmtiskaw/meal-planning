import { describe, expect, it } from 'vitest';

import type { SavedItem } from '@/_actions/library/types';

import { savedItemName } from './savedItemName';

const savedItems: SavedItem[] = [
	{ _id: 'saved-1', name: 'Lemon Herb Chicken', kind: 'recipe', tags: [] },
];

describe('savedItemName', () => {
	it('names the saved item with that id', () => {
		expect(savedItemName(savedItems, 'saved-1')).toBe('Lemon Herb Chicken');
	});

	it('falls back to a plain label when the planner no longer has the item', () => {
		expect(savedItemName(savedItems, 'deleted')).toBe('Saved recipe');
	});
});
