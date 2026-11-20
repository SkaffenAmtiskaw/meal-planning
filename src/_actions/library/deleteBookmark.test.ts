import { beforeEach, describe, expect, test, vi } from 'vitest';

import { plannerCache } from '@/_actions/_utils/caches';
import { invalidate } from '@/_actions/_utils/invalidate';
import { checkAuth } from '@/_actions/auth/checkAuth';
import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';

import { deleteBookmark } from './deleteBookmark';

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

const validData = { plannerId, bookmarkId };

describe('deleteBookmark', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	test("checks write access to the bookmark's planner", async () => {
		await deleteBookmark(validData);

		expect(checkAuth).toHaveBeenCalledWith(plannerId, 'write');
	});

	test('returns Bookmark not found error when no planner has the bookmark', async () => {
		vi.mocked(planners.updateOne).mockResolvedValueOnce({
			matchedCount: 0,
		} as never);

		const result = await deleteBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Bookmark not found' });
	});

	test('pulls the bookmark from the planner and returns ok', async () => {
		const result = await deleteBookmark(validData);

		expect(planners.updateOne).toHaveBeenCalledWith(
			{ _id: plannerId, 'saved._id': bookmarkId },
			{ $pull: { saved: { _id: bookmarkId } } },
		);
		expect(result).toEqual({ ok: true, data: undefined });
	});

	test("invalidates the planner's saved items", async () => {
		await deleteBookmark(validData);

		expect(invalidate).toHaveBeenCalledWith([plannerCache.saved(plannerId)]);
	});
});
