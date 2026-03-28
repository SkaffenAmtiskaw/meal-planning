import { Types } from 'mongoose';
import { describe, expect, test } from 'vitest';

import { zTagInterface } from './tag';

describe('tag interface', () => {
	const tagId = new Types.ObjectId().toString();

	test('accepts a valid tag', () => {
		expect(
			zTagInterface.safeParse({ _id: tagId, name: 'Villain', color: '#8B0000' })
				.success,
		).toBe(true);
	});

	test('rejects a tag missing _id', () => {
		expect(
			zTagInterface.safeParse({ name: 'Villain', color: '#8B0000' }).success,
		).toBe(false);
	});

	test('rejects a tag with an invalid _id', () => {
		expect(
			zTagInterface.safeParse({
				_id: 'not-an-id',
				name: 'Villain',
				color: '#8B0000',
			}).success,
		).toBe(false);
	});

	test('rejects a tag missing name', () => {
		expect(
			zTagInterface.safeParse({ _id: tagId, color: '#8B0000' }).success,
		).toBe(false);
	});

	test('rejects a tag missing color', () => {
		expect(
			zTagInterface.safeParse({ _id: tagId, name: 'Villain' }).success,
		).toBe(false);
	});

	test('rejects a tag with non-string name', () => {
		expect(
			zTagInterface.safeParse({ _id: tagId, name: 42, color: '#8B0000' })
				.success,
		).toBe(false);
	});
});
