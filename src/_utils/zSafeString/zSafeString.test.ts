import { describe, expect, test } from 'vitest';

import { zSafeString } from './zSafeString';

describe('zSafeString', () => {
	test('accepts letters, numbers, spaces, apostrophes, periods, commas, hyphens', () => {
		const schema = zSafeString();
		expect(schema.safeParse("O'Brien").success).toBe(true);
		expect(schema.safeParse('Jean-Paul').success).toBe(true);
		expect(schema.safeParse('Dr. Smith, Jr.').success).toBe(true);
		expect(schema.safeParse('User123').success).toBe(true);
	});

	test('rejects empty string', () => {
		const result = zSafeString().safeParse('');
		expect(result.success).toBe(false);
	});

	test('rejects strings exceeding default max length of 50', () => {
		const result = zSafeString().safeParse('a'.repeat(51));
		expect(result.success).toBe(false);
	});

	test('accepts strings at exactly the default max length', () => {
		const result = zSafeString().safeParse('a'.repeat(50));
		expect(result.success).toBe(true);
	});

	test('respects custom max length', () => {
		const schema = zSafeString(10);
		expect(schema.safeParse('a'.repeat(10)).success).toBe(true);
		expect(schema.safeParse('a'.repeat(11)).success).toBe(false);
	});

	test('rejects $ character', () => {
		expect(zSafeString().safeParse('$evil').success).toBe(false);
	});

	test('rejects NoSQL injection attempt with $ and curly braces', () => {
		expect(zSafeString().safeParse('{$gt: 1}').success).toBe(false);
	});

	test('rejects angle brackets', () => {
		expect(zSafeString().safeParse('<script>').success).toBe(false);
	});

	test('rejects curly braces', () => {
		expect(zSafeString().safeParse('{evil}').success).toBe(false);
	});

	test('rejects backslash', () => {
		expect(zSafeString().safeParse('back\\slash').success).toBe(false);
	});
});
