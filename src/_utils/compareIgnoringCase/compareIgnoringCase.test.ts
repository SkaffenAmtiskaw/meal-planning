import { describe, expect, it } from 'vitest';

import { compareIgnoringCase } from './compareIgnoringCase';

describe('compareIgnoringCase', () => {
	it('orders strings alphabetically, ignoring case', () => {
		expect(['banana', 'Cherry', 'apple'].toSorted(compareIgnoringCase)).toEqual(
			['apple', 'banana', 'Cherry'],
		);
	});

	it('treats strings that differ only in case as equal', () => {
		expect(compareIgnoringCase('Tacos', 'tacos')).toBe(0);
	});
});
