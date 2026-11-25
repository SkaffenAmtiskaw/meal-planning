import { describe, expect, it } from 'vitest';

import { phoneListTitle } from './phoneListTitle';

describe('phoneListTitle', () => {
	it.each([
		{ typed: 'nothing', search: '' },
		{ typed: 'a search', search: 'pas' },
	])('titles the list from the saved recipes with $typed typed', ({
		search,
	}) => {
		expect(phoneListTitle({ search, tagIds: [] })).toBe(
			'From your saved recipes',
		);
	});
});
