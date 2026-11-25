import { describe, expect, it } from 'vitest';

import { makeDishDraft } from '#fixtures/dish';

import { isBlankDish } from './isBlankDish';

describe('isBlankDish', () => {
	it('is blank with nothing in it, counting spaces as nothing', () => {
		expect(isBlankDish(makeDishDraft())).toBe(true);
		expect(isBlankDish(makeDishDraft({ name: '  ', note: ' ' }))).toBe(true);
	});

	it.each([
		{ field: 'a name', dish: makeDishDraft({ name: 'Soup' }) },
		{ field: 'a note', dish: makeDishDraft({ note: 'Buy rolls' }) },
		{
			field: 'a recipe',
			dish: makeDishDraft({ source: { kind: 'saved', savedId: 'saved-1' } }),
		},
		{
			field: 'a reference',
			dish: makeDishDraft({ source: { kind: 'reference', text: 'p. 12' } }),
		},
	])('is not blank with $field', ({ dish }) => {
		expect(isBlankDish(dish)).toBe(false);
	});
});
