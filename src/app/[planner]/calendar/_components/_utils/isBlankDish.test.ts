import { describe, expect, it } from 'vitest';

import { makeDishValues } from '#fixtures/dish';

import { isBlankDish } from './isBlankDish';

describe('isBlankDish', () => {
	it('is blank with nothing in it, counting spaces as nothing', () => {
		expect(isBlankDish(makeDishValues())).toBe(true);
		expect(isBlankDish(makeDishValues({ name: '  ', note: ' ' }))).toBe(true);
	});

	it.each([
		{ field: 'a name', dish: makeDishValues({ name: 'Soup' }) },
		{ field: 'a note', dish: makeDishValues({ note: 'Buy rolls' }) },
		{
			field: 'a recipe',
			dish: makeDishValues({ source: { kind: 'saved', savedId: 'saved-1' } }),
		},
		{
			field: 'a reference',
			dish: makeDishValues({ source: { kind: 'reference', text: 'p. 12' } }),
		},
	])('is not blank with $field', ({ dish }) => {
		expect(isBlankDish(dish)).toBe(false);
	});
});
