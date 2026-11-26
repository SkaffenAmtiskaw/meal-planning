import { describe, expect, it } from 'vitest';

import { compareIgnoringCaseAndAccents } from './compareIgnoringCaseAndAccents';

describe('compareIgnoringCaseAndAccents', () => {
	it('orders strings alphabetically, ignoring case', () => {
		expect(
			['banana', 'Cherry', 'apple'].toSorted(compareIgnoringCaseAndAccents),
		).toEqual(['apple', 'banana', 'Cherry']);
	});

	it('treats strings that differ only in case as equal', () => {
		expect(compareIgnoringCaseAndAccents('Tacos', 'tacos')).toBe(0);
	});

	it('treats strings that differ only in accents as equal', () => {
		expect(compareIgnoringCaseAndAccents('Crème brûlée', 'creme brulee')).toBe(
			0,
		);
	});
});
