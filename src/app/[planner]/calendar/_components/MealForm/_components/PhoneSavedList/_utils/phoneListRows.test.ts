import { describe, expect, it } from 'vitest';

import { makeSavedItem } from '#fixtures/savedItem';

import { phoneListRows } from './phoneListRows';

const results = ['A', 'B', 'C', 'D', 'E', 'F'].map((name) =>
	makeSavedItem({ name }),
);

describe('phoneListRows', () => {
	it('lists the first 5 results with nothing typed and no tag selected', () => {
		expect(phoneListRows(results, { search: ' ', tagIds: [] })).toEqual(
			results.slice(0, 5),
		);
	});

	it.each([
		{ narrowed: 'something typed', criteria: { search: 'pas', tagIds: [] } },
		{ narrowed: 'a tag selected', criteria: { search: '', tagIds: ['quick'] } },
	])('lists every result with $narrowed', ({ criteria }) => {
		expect(phoneListRows(results, criteria)).toEqual(results);
	});
});
