import { beforeEach, describe, expect, it, vi } from 'vitest';

import { plannerCache } from '@/_actions/_utils/caches';
import { invalidate } from '@/_actions/_utils/invalidate';
import { checkAuth } from '@/_actions/auth/checkAuth';
import { planners } from '@/_models/database/planners';

import { addTag } from './addTag';

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
vi.mock('@/_theme/colors', async () => ({
	TAG_COLOR_NAMES: ['red', 'green', 'blue'],
}));

const plannerId = '507f1f77bcf86cd799439011';

const makePlanner = (tagCount = 0) =>
	({ tags: Array.from({ length: tagCount }) }) as never;

describe('addTag', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('returns an error without checking access when the planner id is invalid', async () => {
		const result = await addTag({ plannerId: 'not-an-id', name: 'Spicy' });

		expect(result.ok).toBe(false);
		expect(checkAuth).not.toHaveBeenCalled();
	});

	it("checks write access to the tag's planner", async () => {
		vi.mocked(planners.findOne).mockResolvedValue(makePlanner(0));

		await addTag({ plannerId, name: 'Spicy' });

		expect(checkAuth).toHaveBeenCalledWith(plannerId, 'write');
	});

	it('returns Planner not found error when planner does not exist', async () => {
		vi.mocked(planners.findOne).mockResolvedValue(null);

		const result = await addTag({ plannerId, name: 'Spicy' });

		expect(result).toEqual({ ok: false, error: 'Planner not found' });
		expect(planners.updateOne).not.toHaveBeenCalled();
	});

	it('assigns the first available color when no tags exist', async () => {
		vi.mocked(planners.findOne).mockResolvedValue(makePlanner(0));

		const result = await addTag({ plannerId, name: 'Spicy' });

		expect(result.ok).toBe(true);
		if (result.ok) expect(result.data.color).toBe('red');
	});

	it('cycles through available colors based on existing tag count', async () => {
		// 4 existing tags → index 4 % 3 = 1 = 'green'
		vi.mocked(planners.findOne).mockResolvedValue(makePlanner(4));

		const result = await addTag({ plannerId, name: 'New' });

		expect(result.ok).toBe(true);
		if (result.ok) expect(result.data.color).toBe('green');
	});

	it('pushes the new tag onto the planner and returns it', async () => {
		vi.mocked(planners.findOne).mockResolvedValue(makePlanner(0));
		const tag = { _id: 'new-id', name: 'Quick', color: 'red' };

		const result = await addTag({ plannerId, name: 'Quick' });

		expect(planners.updateOne).toHaveBeenCalledWith(
			{ _id: plannerId },
			{ $push: { tags: tag } },
		);
		expect(result).toEqual({ ok: true, data: tag });
	});

	it("invalidates the planner's tags", async () => {
		vi.mocked(planners.findOne).mockResolvedValue(makePlanner(0));

		await addTag({ plannerId, name: 'Quick' });

		expect(invalidate).toHaveBeenCalledWith([plannerCache.tags(plannerId)]);
	});
});
