import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';

import { editBookmark } from './editBookmark';

vi.mock('@/_actions/auth/checkAuth', () => ({
	checkAuth: vi.fn(),
}));

vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}));

vi.mock('@/_models', () => ({
	Planner: {
		collection: {
			updateOne: vi.fn(),
		},
	},
}));

const plannerId = new Types.ObjectId().toString();
const bookmarkId = new Types.ObjectId().toString();

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
		expect(Planner.collection.updateOne).not.toHaveBeenCalled();
	});

	test('returns Unauthorized error when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthorized' });

		const result = await editBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
	});

	test('returns Bookmark not found error when matchedCount is 0', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 0,
		} as never);

		const result = await editBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Bookmark not found' });
	});

	test('$sets name, url and tags', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		const tagId = new Types.ObjectId().toString();
		await editBookmark({ ...validData, tags: [tagId] });

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.objectContaining({
				_id: expect.any(Types.ObjectId),
				'saved._id': expect.any(Types.ObjectId),
			}),
			{
				$set: {
					'saved.$.name': 'Ursula Sea Spells',
					'saved.$.url': 'https://undersea.example.com/spells',
					'saved.$.tags': [expect.any(Types.ObjectId)],
				},
			},
		);
	});

	test('$sets empty tags array when tags is absent', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		await editBookmark(validData);

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				$set: expect.objectContaining({ 'saved.$.tags': [] }),
			}),
		);
	});

	test('revalidates list path on success', async () => {
		const { revalidatePath } = await import('next/cache');
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		await editBookmark(validData);

		expect(revalidatePath).toHaveBeenCalledWith(`/${plannerId}/recipes`);
	});

	test('does not revalidate when bookmark is not found', async () => {
		const { revalidatePath } = await import('next/cache');
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 0,
		} as never);

		await editBookmark(validData);

		expect(revalidatePath).not.toHaveBeenCalled();
	});

	test('returns _id and name on success', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		const result = await editBookmark(validData);

		expect(result).toEqual({
			ok: true,
			data: { _id: bookmarkId, name: 'Ursula Sea Spells' },
		});
	});
});
