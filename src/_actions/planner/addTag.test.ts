import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';

import { addTag } from './addTag';

vi.mock('@/_actions/auth/checkAuth', () => ({
	checkAuth: vi.fn(),
}));

vi.mock('@/_models', () => ({
	Planner: {
		findById: vi.fn(),
	},
}));

const plannerId = new Types.ObjectId().toString();

describe('addTag', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	/**
	 * Builds a mock Mongoose planner whose tags array simulates Mongoose
	 * subdocument behaviour: push injects a generated _id onto the item.
	 */
	const makePlanner = (
		existingCount = 0,
		pushedTagId = new Types.ObjectId(),
	) => {
		const tags: { _id: Types.ObjectId; name: string; color: string }[] =
			Array.from({ length: existingCount }, (_, i) => ({
				_id: new Types.ObjectId(),
				name: `Tag ${i}`,
				color: 'red',
			}));

		// Simulate Mongoose auto-assigning _id on subdoc push
		const origPush = tags.push.bind(tags);
		vi.spyOn(tags, 'push').mockImplementation(
			(item: { name: string; color: string }) => {
				return origPush({ ...item, _id: pushedTagId });
			},
		);

		return { tags, save: vi.fn().mockResolvedValue(undefined) };
	};

	test('returns Unauthorized error when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthenticated' });

		const result = await addTag(plannerId, 'Spicy');

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(Planner.findById).not.toHaveBeenCalled();
	});

	test('returns Unauthorized error when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthorized' });

		const result = await addTag(plannerId, 'Spicy');

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
	});

	test('returns Planner not found error when planner does not exist', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(null);

		const result = await addTag(plannerId, 'Spicy');

		expect(result).toEqual({ ok: false, error: 'Planner not found' });
	});

	test('assigns the first COLORS entry to the first tag', async () => {
		const tagId = new Types.ObjectId();
		const planner = makePlanner(0, tagId);
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(planner as never);

		const result = await addTag(plannerId, 'Spicy');

		expect(result).toEqual({
			ok: true,
			data: { _id: tagId.toString(), name: 'Spicy', color: 'red' },
		});
	});

	test('cycles through COLORS based on existing tag count', async () => {
		const tagId = new Types.ObjectId();
		// 3 existing tags → 4th color = 'violet'
		const planner = makePlanner(3, tagId);
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(planner as never);

		const result = await addTag(plannerId, 'New');

		expect(result.ok).toBe(true);
		if (result.ok) expect(result.data.color).toBe('violet');
	});

	test('saves the planner after adding the tag', async () => {
		const planner = makePlanner(0, new Types.ObjectId());
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(planner as never);

		await addTag(plannerId, 'Quick');

		expect(planner.save).toHaveBeenCalledOnce();
	});
});
