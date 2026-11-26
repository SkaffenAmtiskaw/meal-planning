import { describe, expect, it } from 'vitest';

import { makeSavedItem } from '#fixtures/savedItem';

import { hasBeenUsed } from './hasBeenUsed';

describe('hasBeenUsed', () => {
	it('is true for an item with a last-used date', () => {
		expect(
			hasBeenUsed(makeSavedItem({ lastUsedAt: '2026-11-24T18:30:00.000Z' })),
		).toBe(true);
	});

	it('is false for an item never used', () => {
		expect(hasBeenUsed(makeSavedItem())).toBe(false);
	});
});
