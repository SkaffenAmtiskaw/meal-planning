import { Types } from 'mongoose';
import { describe, expect, test, vi } from 'vitest';

// vite resolves the full importer graph when bookmark.ts is loaded, which causes planner.ts
// to be executed. planner.ts then imports '@/_models/planner/bookmark' (the same bookmark.ts
// still being loaded), producing a partial module where zBookmarkInterface is undefined.
// Mocking planner.ts prevents its body from executing in this test's context.
vi.mock('./planner', () => ({}));

import { zBookmarkInterface } from './bookmark';

const bookmarkId = new Types.ObjectId().toString();
const tagId = new Types.ObjectId().toString();

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

	test('rejects a bookmark with an invalid tag ObjectId', () => {
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
});
