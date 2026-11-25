import { describe, expect, it } from 'vitest';

import { phoneListTitle } from './phoneListTitle';

describe('phoneListTitle', () => {
	it('titles the list from the saved recipes with no tag selected', () => {
		expect(phoneListTitle({ selectedTagNames: [] })).toBe(
			'From your saved recipes',
		);
	});

	it('names the selected tags, in pick order', () => {
		expect(phoneListTitle({ selectedTagNames: ['Thai', 'Quick'] })).toBe(
			'Saved · Thai + Quick',
		);
	});
});
