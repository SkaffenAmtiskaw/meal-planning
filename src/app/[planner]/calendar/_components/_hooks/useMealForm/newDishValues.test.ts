import { describe, expect, it } from 'vitest';

import { newDishValues } from './newDishValues';

describe('newDishValues', () => {
	it('gives each new dish its own key', () => {
		expect(newDishValues().key).not.toBe(newDishValues().key);
	});
});
