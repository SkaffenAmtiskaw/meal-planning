import { describe, expect, it, vi } from 'vitest';

import type { SavedItem } from '@/_actions/library/types';

import { filterSavedItems } from './filterSavedItems';
import { orderSavedItems } from './orderSavedItems';
import { phoneListRows } from './phoneListRows';

vi.mock('./orderSavedItems', () => ({
	orderSavedItems: vi.fn(() => []),
}));
vi.mock('./filterSavedItems', () => ({
	filterSavedItems: vi.fn(() => []),
}));

const item = (name: string): SavedItem => ({
	_id: name,
	name,
	kind: 'recipe',
	tags: [],
});

const ordered = ['A', 'B', 'C', 'D', 'E', 'F'].map(item);

describe('phoneListRows', () => {
	it('lists the first 5 in order before anything is typed', () => {
		vi.mocked(orderSavedItems).mockReturnValueOnce(ordered);

		expect(phoneListRows(ordered, { search: ' ' })).toEqual(
			ordered.slice(0, 5),
		);
	});

	it('lists every match, in order, once something is typed', () => {
		vi.mocked(orderSavedItems).mockReturnValueOnce(ordered);
		vi.mocked(filterSavedItems).mockReturnValueOnce(ordered);

		expect(phoneListRows(ordered, { search: 'pas' })).toEqual(ordered);
		expect(filterSavedItems).toHaveBeenLastCalledWith(ordered, {
			search: 'pas',
		});
	});
});
