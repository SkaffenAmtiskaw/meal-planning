import { describe, expect, test } from 'vitest';

import { zOptionalNonEmptyString } from './zOptionalNonEmptyString';

describe('zOptionalNonEmptyString', () => {
	test('accepts a string with a value', () => {
		expect(zOptionalNonEmptyString.safeParse('Notes').success).toBe(true);
	});

	test('accepts the field left out', () => {
		expect(zOptionalNonEmptyString.safeParse(undefined).success).toBe(true);
	});

	test('rejects the field set to an empty string rather than left out', () => {
		expect(zOptionalNonEmptyString.safeParse('').success).toBe(false);
	});
});
