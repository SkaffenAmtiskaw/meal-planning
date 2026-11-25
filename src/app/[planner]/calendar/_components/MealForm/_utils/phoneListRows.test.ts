import { describe, expect, it, vi } from 'vitest';

import { makeSavedItem } from '#fixtures/savedItem';

import { filterSavedItems } from './filterSavedItems';
import { orderSavedItems } from './orderSavedItems';
import { phoneListRows } from './phoneListRows';

vi.mock('./orderSavedItems', () => ({
	orderSavedItems: vi.fn(() => []),
}));
vi.mock('./filterSavedItems', () => ({
	filterSavedItems: vi.fn(() => []),
}));

const ordered = ['A', 'B', 'C', 'D', 'E', 'F'].map((name) =>
	makeSavedItem({ name }),
);

describe('phoneListRows', () => {
	it('lists the first 5 in order before anything is typed', () => {
		vi.mocked(orderSavedItems).mockReturnValueOnce(ordered);

		expect(phoneListRows(ordered, { search: ' ', tagIds: [] })).toEqual(
			ordered.slice(0, 5),
		);
	});

	it('lists every match, in order, once something is typed', () => {
		vi.mocked(orderSavedItems).mockReturnValueOnce(ordered);
		vi.mocked(filterSavedItems).mockReturnValueOnce(ordered);

		expect(phoneListRows(ordered, { search: 'pas', tagIds: [] })).toEqual(
			ordered,
		);
		expect(filterSavedItems).toHaveBeenLastCalledWith(ordered, {
			search: 'pas',
			tagIds: [],
		});
	});
});
