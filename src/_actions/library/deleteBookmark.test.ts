import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';

import { deleteBookmark } from './deleteBookmark';

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
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('throws ZodError on invalid input', async () => {
		await expect(deleteBookmark({})).rejects.toThrow();
	});

	test('returns Unauthorized error when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthenticated' });

		const result = await deleteBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(planners.updateOne).not.toHaveBeenCalled();
	});

	test('returns Unauthorized error when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthorized' });

		const result = await deleteBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
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
});
