import { afterEach, describe, expect, test, vi } from 'vitest';

import { revalidatePath } from 'next/cache';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';

import { editBookmark } from './editBookmark';

vi.mock(
	'@/_actions/auth/checkAuth',
	async () => await import('#mocks/@/_actions/auth/checkAuth'),
);

vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}));

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
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('throws ZodError on invalid input', async () => {
		await expect(editBookmark({})).rejects.toThrow();
	});

	test('throws ZodError when _id is missing', async () => {
		const { _id: _, ...withoutId } = validData;
		await expect(editBookmark(withoutId)).rejects.toThrow();
	});

	test('throws ZodError when name is empty string', async () => {
		await expect(editBookmark({ ...validData, name: '' })).rejects.toThrow();
	});

	test('throws ZodError when url is invalid', async () => {
		await expect(
			editBookmark({ ...validData, url: 'not-a-url' }),
		).rejects.toThrow();
	});

	test('returns Unauthorized error when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthenticated' });

		const result = await editBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(planners.updateOne).not.toHaveBeenCalled();
	});

	test('returns Unauthorized error when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthorized' });

		const result = await editBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
	});

	test('returns Bookmark not found error and does not revalidate when matchedCount is 0', async () => {
		vi.mocked(planners.updateOne).mockResolvedValueOnce({
			matchedCount: 0,
		} as never);

		const result = await editBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Bookmark not found' });
		expect(revalidatePath).not.toHaveBeenCalled();
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

	test('revalidates the list path and returns _id and name on success', async () => {
		const result = await editBookmark(validData);

		expect(revalidatePath).toHaveBeenCalledWith(`/${plannerId}/recipes`);
		expect(result).toEqual({
			ok: true,
			data: { _id: bookmarkId, name: 'Ursula Sea Spells' },
		});
	});
});
