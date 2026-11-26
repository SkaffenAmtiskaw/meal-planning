import { describe, expect, it, vi } from 'vitest';

import { makeSavedItem } from '#fixtures/savedItem';

import { phoneListRows } from './phoneListRows';
import { pickStartingSuggestions } from './pickStartingSuggestions';

vi.mock('./pickStartingSuggestions', () => ({
	pickStartingSuggestions: vi.fn(() => []),
}));

const results = ['A', 'B', 'C'].map((name) => makeSavedItem({ name }));

describe('phoneListRows', () => {
	it('lists the starting suggestions with nothing typed and no tag selected', () => {
		vi.mocked(pickStartingSuggestions).mockReturnValueOnce([results[1]]);

		expect(phoneListRows(results, { search: ' ', tagIds: [] })).toEqual([
			results[1],
		]);
		expect(pickStartingSuggestions).toHaveBeenCalledWith(results);
	});

	it.each([
		{ narrowed: 'something typed', criteria: { search: 'pas', tagIds: [] } },
		{ narrowed: 'a tag selected', criteria: { search: '', tagIds: ['quick'] } },
	])('lists every result with $narrowed', ({ criteria }) => {
		expect(phoneListRows(results, criteria)).toEqual(results);
	});
});
