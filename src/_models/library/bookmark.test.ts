import { describe, expect, test, vi } from 'vitest';

import { model } from 'mongoose';

// vite resolves the full importer graph when bookmark.ts is loaded, which causes planner.ts
// to be executed. planner.ts then imports '@/_models/library' (the same bookmark.ts
// still being loaded), producing a partial module where zBookmarkInterface is undefined.
// Mocking planner.ts prevents its body from executing in this test's context.
vi.mock('./planner', () => ({}));

import {
	bookmarkSchema,
	zBookmarkFormSchema,
	zBookmarkInterface,
} from './bookmark';

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
});

describe('bookmark schema', () => {
	test('gives a new bookmark a string _id', () => {
		const Bookmark = model('BookmarkSchemaTest', bookmarkSchema);
		const { _id } = new Bookmark({ name: "Ursula's Sea Spells" }).toObject();

		expect(_id).toMatch(/^[0-9a-f]{24}$/);
	});
});

describe('zBookmarkFormSchema', () => {
	const plannerId = newId();

	const validForm = {
		name: "Ursula's Sea Spell Collection",
		url: 'https://undersea.example.com/spells',
		tags: [tagId],
		plannerId,
	};

	test('accepts a valid form payload', () => {
		expect(zBookmarkFormSchema.safeParse(validForm).success).toBe(true);
	});

	test('accepts an empty tags array', () => {
		expect(
			zBookmarkFormSchema.safeParse({ ...validForm, tags: [] }).success,
		).toBe(true);
	});

	test('rejects an empty name', () => {
		expect(
			zBookmarkFormSchema.safeParse({ ...validForm, name: '' }).success,
		).toBe(false);
	});

	test('rejects an invalid URL', () => {
		expect(
			zBookmarkFormSchema.safeParse({ ...validForm, url: 'not-a-url' }).success,
		).toBe(false);
	});

	test('rejects a missing plannerId', () => {
		const { plannerId: _, ...rest } = validForm;
		expect(zBookmarkFormSchema.safeParse(rest).success).toBe(false);
	});

	test('accepts an optional notes field', () => {
		expect(
			zBookmarkFormSchema.safeParse({ ...validForm, notes: 'Some notes' })
				.success,
		).toBe(true);
	});

	test('accepts form without notes', () => {
		expect(zBookmarkFormSchema.safeParse(validForm).success).toBe(true);
	});

	test('accepts notes set to an empty string, which the form starts at', () => {
		expect(
			zBookmarkFormSchema.safeParse({ ...validForm, notes: '' }).success,
		).toBe(true);
	});
});
