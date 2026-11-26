import { describe, expect, test } from 'vitest';

import { zBookmarkInterface } from './bookmark.types';

import { newId } from '../database/newId';

const bookmarkId = newId();
const tagId = newId();

const validBookmark = {
	_id: bookmarkId,
	name: "Ursula's Sea Spell Collection",
	url: 'https://undersea.example.com/spells',
	tags: [tagId],
};

describe('bookmark interface', () => {
	test('accepts a valid bookmark', () => {
		expect(zBookmarkInterface.safeParse(validBookmark).success).toBe(true);
	});

	test('accepts a bookmark with an empty tags array', () => {
		expect(
			zBookmarkInterface.safeParse({ ...validBookmark, tags: [] }).success,
		).toBe(true);
	});

	test('rejects a bookmark with an invalid URL', () => {
		expect(
			zBookmarkInterface.safeParse({ ...validBookmark, url: 'not-a-url' })
				.success,
		).toBe(false);
	});

	test('rejects a bookmark with an invalid tag id', () => {
		expect(
			zBookmarkInterface.safeParse({
				...validBookmark,
				tags: ['not-an-objectid'],
			}).success,
		).toBe(false);
	});

	test('rejects a bookmark missing name', () => {
		const { name: _, ...rest } = validBookmark;
		expect(zBookmarkInterface.safeParse(rest).success).toBe(false);
	});

	test('rejects a bookmark missing url', () => {
		const { url: _, ...rest } = validBookmark;
		expect(zBookmarkInterface.safeParse(rest).success).toBe(false);
	});

	test('rejects a bookmark with an invalid _id', () => {
		expect(
			zBookmarkInterface.safeParse({ ...validBookmark, _id: 'bad-id' }).success,
		).toBe(false);
	});

	test('accepts a bookmark with an optional notes field', () => {
		expect(
			zBookmarkInterface.safeParse({
				...validBookmark,
				notes: 'Great recipe source',
			}).success,
		).toBe(true);
	});

	test('accepts a bookmark without notes', () => {
		expect(zBookmarkInterface.safeParse(validBookmark).success).toBe(true);
	});

	test('accepts a bookmark with a last-used date', () => {
		expect(
			zBookmarkInterface.safeParse({ ...validBookmark, lastUsed: new Date() })
				.success,
		).toBe(true);
	});

	test('rejects a last-used date that is not a date', () => {
		expect(
			zBookmarkInterface.safeParse({
				...validBookmark,
				lastUsed: '2026-11-26T00:00:00.000Z',
			}).success,
		).toBe(false);
	});
});
