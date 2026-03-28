import { Types } from 'mongoose';
import { describe, expect, test } from 'vitest';

import { zObjectId } from './zObjectId';

describe('z object id', () => {
	test('accepts a valid ObjectId string', () => {
		const id = new Types.ObjectId().toString();
		expect(zObjectId.safeParse(id).success).toBe(true);
	});

	test('rejects a non-ObjectId string', () => {
		expect(zObjectId.safeParse('maleficent').success).toBe(false);
	});

	test('rejects a number', () => {
		expect(zObjectId.safeParse(42).success).toBe(false);
	});

	test('rejects null', () => {
		expect(zObjectId.safeParse(null).success).toBe(false);
	});

	test('rejects an empty string', () => {
		expect(zObjectId.safeParse('').success).toBe(false);
	});

	test('includes a descriptive error message for invalid values', () => {
		const result = zObjectId.safeParse('not-an-id');
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('ObjectId is invalid');
		}
	});
});
