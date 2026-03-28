import { describe, expect, test } from 'vitest';

import { zTagInterface } from './tag';

describe('tag interface', () => {
	test('accepts a valid tag', () => {
		expect(
			zTagInterface.safeParse({ name: 'Villain', color: '#8B0000' }).success,
		).toBe(true);
	});

	test('rejects a tag missing name', () => {
		expect(zTagInterface.safeParse({ color: '#8B0000' }).success).toBe(false);
	});

	test('rejects a tag missing color', () => {
		expect(zTagInterface.safeParse({ name: 'Villain' }).success).toBe(false);
	});

	test('rejects a tag with non-string name', () => {
		expect(
			zTagInterface.safeParse({ name: 42, color: '#8B0000' }).success,
		).toBe(false);
	});
});
