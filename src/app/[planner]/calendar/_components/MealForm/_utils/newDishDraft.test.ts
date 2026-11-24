import { describe, expect, it } from 'vitest';

import { newDishDraft } from './newDishDraft';

describe('newDishDraft', () => {
	it('gives each new dish its own key', () => {
		expect(newDishDraft().key).not.toBe(newDishDraft().key);
	});
});
