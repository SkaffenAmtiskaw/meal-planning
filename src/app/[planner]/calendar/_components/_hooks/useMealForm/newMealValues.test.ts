import { describe, expect, it } from 'vitest';

import { newMealValues } from './newMealValues';

describe('newMealValues', () => {
	it('starts on the date it was opened with', () => {
		expect(newMealValues('2026-11-27').date).toBe('2026-11-27');
	});

	it('starts with no date when opened without one', () => {
		expect(newMealValues().date).toBe('');
	});
});
