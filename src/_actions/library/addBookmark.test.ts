import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { planners } from '@/_models/database/planners';

import { addBookmark } from './addBookmark';

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
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('throws ZodError on invalid input', async () => {
		await expect(addBookmark({})).rejects.toThrow();
	});

	test('throws ZodError when name is empty string', async () => {
		await expect(addBookmark({ ...validData, name: '' })).rejects.toThrow();
	});

	test('throws ZodError when url is invalid', async () => {
		await expect(
			addBookmark({ ...validData, url: 'not-a-url' }),
		).rejects.toThrow();
	});

	test('returns Unauthorized error when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthenticated' });

		const result = await addBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(planners.updateOne).not.toHaveBeenCalled();
	});

	test('returns Unauthorized error when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthorized' });

		const result = await addBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
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
});
