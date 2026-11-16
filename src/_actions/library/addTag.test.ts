import { afterEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { planners } from '@/_models/database/planners';

import { addTag } from './addTag';

vi.mock(
	'@/_actions/auth/checkAuth',
	async () => await import('#mocks/@/_actions/auth/checkAuth'),
);

vi.mock(
	'@/_models/database/planners',
	async () => await import('#mocks/@/_models/database/planners'),
);

vi.mock('@/_theme/colors', async () => ({
	TAG_COLOR_NAMES: ['red', 'green', 'blue'],
}));

vi.mock(
	'@/_models/database/newId',
	async () => await import('#mocks/@/_models/database/newId'),
);

const plannerId = '507f1f77bcf86cd799439011';

const makePlanner = (tagCount = 0) =>
	({ tags: Array.from({ length: tagCount }) }) as never;

describe('addTag', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	it('returns Unauthorized error when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthenticated' });

		const result = await addTag(plannerId, 'Spicy');

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(planners.findOne).not.toHaveBeenCalled();
	});

	it('returns Unauthorized error when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthorized' });

		const result = await addTag(plannerId, 'Spicy');

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(planners.findOne).not.toHaveBeenCalled();
	});

	it('returns Planner not found error when planner does not exist', async () => {
		vi.mocked(planners.findOne).mockResolvedValue(null);

		const result = await addTag(plannerId, 'Spicy');

		expect(result).toEqual({ ok: false, error: 'Planner not found' });
		expect(planners.updateOne).not.toHaveBeenCalled();
	});

	it('assigns the first available color when no tags exist', async () => {
		vi.mocked(planners.findOne).mockResolvedValue(makePlanner(0));

		const result = await addTag(plannerId, 'Spicy');

		expect(result.ok).toBe(true);
		if (result.ok) expect(result.data.color).toBe('red');
	});

	it('cycles through available colors based on existing tag count', async () => {
		// 4 existing tags → index 4 % 3 = 1 = 'green'
		vi.mocked(planners.findOne).mockResolvedValue(makePlanner(4));

		const result = await addTag(plannerId, 'New');

		expect(result.ok).toBe(true);
		if (result.ok) expect(result.data.color).toBe('green');
	});

	it('pushes the new tag onto the planner and returns it', async () => {
		vi.mocked(planners.findOne).mockResolvedValue(makePlanner(0));
		const tag = { _id: 'new-id', name: 'Quick', color: 'red' };

		const result = await addTag(plannerId, 'Quick');

		expect(planners.updateOne).toHaveBeenCalledWith(
			{ _id: plannerId },
			{ $push: { tags: tag } },
		);
		expect(result).toEqual({ ok: true, data: tag });
	});
});
