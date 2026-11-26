import { beforeEach, describe, expect, test, vi } from 'vitest';

import { plannerCache } from '@/_actions/_utils/caches';
import { invalidate } from '@/_actions/_utils/invalidate';
import { checkAuth } from '@/_actions/auth/checkAuth';
import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';

import { editBookmark } from './editBookmark';

vi.mock(
	'@/_actions/_utils/invalidate',
	async () => await import('#mocks/@/_actions/_utils/invalidate'),
);
vi.mock(
	'@/_actions/auth/checkAuth',
	async () => await import('#mocks/@/_actions/auth/checkAuth'),
);
vi.mock(
	'@/_models/database/planners',
	async () => await import('#mocks/@/_models/database/planners'),
);

const plannerId = newId();
const bookmarkId = newId();

const validData = {
	plannerId,
	_id: bookmarkId,
	name: 'Ursula Sea Spells',
	url: 'https://undersea.example.com/spells',
	tags: [],
};

describe('editBookmark', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	test("checks write access to the bookmark's planner", async () => {
		await editBookmark(validData);

		expect(checkAuth).toHaveBeenCalledWith(plannerId, 'write');
	});

	test('returns Bookmark not found error when matchedCount is 0', async () => {
		vi.mocked(planners.updateOne).mockResolvedValueOnce({
			matchedCount: 0,
		} as never);

		const result = await editBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Bookmark not found' });
	});

	test('$sets name, url and tags on the matched bookmark', async () => {
		const tagId = newId();
		await editBookmark({ ...validData, tags: [tagId] });

		expect(planners.updateOne).toHaveBeenCalledWith(
			{ _id: plannerId, 'saved._id': bookmarkId },
			expect.objectContaining({
				$set: expect.objectContaining({
					'saved.$.name': 'Ursula Sea Spells',
					'saved.$.url': 'https://undersea.example.com/spells',
					'saved.$.tags': [tagId],
				}),
			}),
		);
	});

	test('$sets notes when notes is provided', async () => {
		await editBookmark({ ...validData, notes: 'Great source' });

		expect(planners.updateOne).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				$set: expect.objectContaining({ 'saved.$.notes': 'Great source' }),
			}),
		);
	});

	test.each([
		['absent', undefined],
		['an empty string', ''],
	])('$unsets notes when notes is %s', async (_, notes) => {
		await editBookmark({ ...validData, notes });

		expect(planners.updateOne).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				$unset: { 'saved.$.notes': '' },
			}),
		);
	});

	test('returns _id and name on success', async () => {
		const result = await editBookmark(validData);

		expect(result).toEqual({
			ok: true,
			data: { _id: bookmarkId, name: 'Ursula Sea Spells' },
		});
	});

	test("invalidates the planner's saved items", async () => {
		await editBookmark(validData);

		expect(invalidate).toHaveBeenCalledWith([plannerCache.saved(plannerId)]);
	});
});
