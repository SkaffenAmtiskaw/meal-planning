import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';

import { deleteBookmark } from './deleteBookmark';

vi.mock('@/_actions/auth/checkAuth', () => ({
	checkAuth: vi.fn(),
}));

vi.mock('@/_models', async () => {
	const { matchesId } = await import('@/_models/utils/matchesId');
	return {
		matchesId,
		Planner: {
			findById: vi.fn(),
		},
	};
});

const plannerId = new Types.ObjectId().toString();
const bookmarkId = new Types.ObjectId().toString();

const validData = { plannerId, bookmarkId };

describe('deleteBookmark', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	const makePlanner = (includeBookmark = true) => {
		const saved = includeBookmark ? [{ _id: bookmarkId }] : [];
		return {
			saved,
			save: vi.fn().mockResolvedValue(undefined),
		};
	};

	test('throws ZodError on invalid input', async () => {
		await expect(deleteBookmark({})).rejects.toThrow();
	});

	test('throws ZodError when plannerId is missing', async () => {
		await expect(deleteBookmark({ bookmarkId })).rejects.toThrow();
	});

	test('throws ZodError when bookmarkId is missing', async () => {
		await expect(deleteBookmark({ plannerId })).rejects.toThrow();
	});

	test('returns Unauthorized error when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthenticated' });

		const result = await deleteBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(Planner.findById).not.toHaveBeenCalled();
	});

	test('returns Unauthorized error when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthorized' });

		const result = await deleteBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
	});

	test('returns Planner not found error when planner does not exist', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'write',
		});
		vi.mocked(Planner.findById).mockResolvedValue(null);

		const result = await deleteBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Planner not found' });
	});

	test('returns Bookmark not found error when bookmarkId is not in saved', async () => {
		const planner = makePlanner(false);
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'write',
		});
		vi.mocked(Planner.findById).mockResolvedValue(planner as never);

		const result = await deleteBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Bookmark not found' });
		expect(planner.save).not.toHaveBeenCalled();
	});

	test('removes the bookmark and returns ok', async () => {
		const planner = makePlanner();
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'write',
		});
		vi.mocked(Planner.findById).mockResolvedValue(planner as never);

		const result = await deleteBookmark(validData);

		expect(planner.saved).toHaveLength(0);
		expect(planner.save).toHaveBeenCalledOnce();
		expect(result).toEqual({ ok: true, data: undefined });
	});
});
