import { beforeEach, describe, expect, test, vi } from 'vitest';

import { plannerCache } from '@/_actions/_utils/caches';
import { invalidate } from '@/_actions/_utils/invalidate';
import { checkAuth } from '@/_actions/auth/checkAuth';
import { planners } from '@/_models/database/planners';

import { addBookmark } from './addBookmark';

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
vi.mock(
	'@/_models/database/newId',
	async () => await import('#mocks/@/_models/database/newId'),
);

const plannerId = '507f1f77bcf86cd799439011';

const validData = {
	plannerId,
	name: "Ursula's Sea Spell Collection",
	url: 'https://undersea.example.com/spells',
	tags: [],
};

const pushedBookmark = () =>
	vi.mocked(planners.updateOne).mock.calls[0][1].$push?.saved;

describe('addBookmark', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	test("checks write access to the bookmark's planner", async () => {
		await addBookmark(validData);

		expect(checkAuth).toHaveBeenCalledWith(plannerId, 'write');
	});

	test('returns Planner not found error when planner does not exist', async () => {
		vi.mocked(planners.updateOne).mockResolvedValueOnce({
			matchedCount: 0,
		} as never);

		const result = await addBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Planner not found' });
	});

	test('pushes the bookmark with a new id and returns that id and its name', async () => {
		const result = await addBookmark(validData);

		expect(planners.updateOne).toHaveBeenCalledWith(
			{ _id: plannerId },
			{
				$push: {
					saved: {
						_id: 'new-id',
						name: validData.name,
						url: validData.url,
						tags: [],
					},
				},
			},
		);
		expect(result).toEqual({
			ok: true,
			data: { _id: 'new-id', name: "Ursula's Sea Spell Collection" },
		});
	});

	test('leaves out notes when they are empty', async () => {
		await addBookmark({ ...validData, notes: '' });

		expect(pushedBookmark()).not.toHaveProperty('notes');
	});

	test('keeps notes when they are filled in', async () => {
		await addBookmark({ ...validData, notes: 'Read later' });

		expect(pushedBookmark()).toHaveProperty('notes', 'Read later');
	});

	test('does not store a lastUsedAt sent with the bookmark, since only the server sets it', async () => {
		await addBookmark({ ...validData, lastUsedAt: new Date() } as never);

		expect(pushedBookmark()).not.toHaveProperty('lastUsedAt');
	});

	test("invalidates the planner's saved items", async () => {
		await addBookmark(validData);

		expect(invalidate).toHaveBeenCalledWith([plannerCache.saved(plannerId)]);
	});
});
