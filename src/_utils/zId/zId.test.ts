import { describe, expect, test } from 'vitest';

import { zId } from './zId';

describe('zId', () => {
	test('accepts a 24-character hex string', () => {
		expect(zId.safeParse('65f1a2b3c4d5e6f7a8b9c0d1').success).toBe(true);
	});

	test('rejects a string that is not 24 hex characters', () => {
		expect(zId.safeParse('maleficent').success).toBe(false);
		expect(zId.safeParse('zzzzzzzzzzzzzzzzzzzzzzzz').success).toBe(false);
	});

	test('rejects a value that is not a string', () => {
		expect(zId.safeParse(42).success).toBe(false);
	});

	test('says the id is invalid', () => {
		const result = zId.safeParse('not-an-id');
		expect(result.error?.issues[0].message).toBe('Id is invalid');
	});
});
