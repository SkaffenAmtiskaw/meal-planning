import { describe, expect, it } from 'vitest';

import { savedItemAction } from './savedItemAction';

describe('savedItemAction', () => {
	it('adds the recipe outside link mode', () => {
		expect(savedItemAction({ added: false, linking: false })).toBe('add');
	});

	it('links the recipe while a dish is being linked', () => {
		expect(savedItemAction({ added: false, linking: true })).toBe('link');
	});

	it.each([
		false,
		true,
	])('has nothing to do once the recipe is on the meal (linking: %s)', (linking) => {
		expect(savedItemAction({ added: true, linking })).toBe('added');
	});
});
