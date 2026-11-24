import { describe, expect, it } from 'vitest';

import { newMealDraft } from './newMealDraft';

describe('newMealDraft', () => {
	it('starts on the date it was opened with', () => {
		expect(newMealDraft('2026-11-27').date).toBe('2026-11-27');
	});

	it('starts with no date when opened without one', () => {
		expect(newMealDraft().date).toBe('');
	});
});
