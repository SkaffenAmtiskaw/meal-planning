import { Types } from 'mongoose';
import { describe, expect, test } from 'vitest';

import { matchesId } from './matchesId';

describe('matchesId', () => {
	test('returns true when string _id matches string id', () => {
		const id = new Types.ObjectId().toString();
		expect(matchesId(id)({ _id: id })).toBe(true);
	});

	test('returns false when _id does not match', () => {
		const id = new Types.ObjectId().toString();
		const other = new Types.ObjectId().toString();
		expect(matchesId(id)({ _id: other })).toBe(false);
	});

	test('returns true when ObjectId _id matches string id', () => {
		const objectId = new Types.ObjectId();
		expect(matchesId(objectId.toString())({ _id: objectId })).toBe(true);
	});

	test('returns true when string _id matches ObjectId id', () => {
		const objectId = new Types.ObjectId();
		expect(matchesId(objectId)({ _id: objectId.toString() })).toBe(true);
	});

	test('returns true when both are ObjectId instances with same value', () => {
		const objectId = new Types.ObjectId();
		const copy = new Types.ObjectId(objectId.toString());
		expect(matchesId(objectId)({ _id: copy })).toBe(true);
	});
});
