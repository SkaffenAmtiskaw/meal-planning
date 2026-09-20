import { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth';
import { Planner } from '@/_models/planner';

import { addTag } from './addTag';

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));

vi.mock(
	'@/_models/planner',
	async () => await import('@mocks/@/_models/planner'),
);

vi.mock('@/_theme/colors', async () => ({
	TAG_COLOR_NAMES: ['red', 'green', 'blue'],
}));

const plannerId = new Types.ObjectId().toString();

const makePlanner = (tagCount = 0) => ({
	tags: Array.from({ length: tagCount }),
});

describe('addTag', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	it('returns Unauthorized error when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthenticated' });

		const result = await addTag(plannerId, 'Spicy');

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(Planner.findById).not.toHaveBeenCalled();
	});

	it('returns Unauthorized error when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthorized' });

		const result = await addTag(plannerId, 'Spicy');

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(Planner.findById).not.toHaveBeenCalled();
	});

	it('returns Planner not found error when planner does not exist', async () => {
		vi.mocked(Planner.findById).mockResolvedValue(null);

		const result = await addTag(plannerId, 'Spicy');

		expect(result).toEqual({ ok: false, error: 'Planner not found' });
		expect(Planner.collection.updateOne).not.toHaveBeenCalled();
	});

	it('assigns the first available color when no tags exist', async () => {
		vi.mocked(Planner.findById).mockResolvedValue(makePlanner(0));

		const result = await addTag(plannerId, 'Spicy');

		expect(result.ok).toBe(true);
		if (result.ok) expect(result.data.color).toBe('red');
	});

	it('cycles through available colors based on existing tag count', async () => {
		// 4 existing tags → index 4 % 3 = 1 = 'green'
		vi.mocked(Planner.findById).mockResolvedValue(makePlanner(4));

		const result = await addTag(plannerId, 'New');

		expect(result.ok).toBe(true);
		if (result.ok) expect(result.data.color).toBe('green');
	});

	it('persists the new tag to the planner', async () => {
		vi.mocked(Planner.findById).mockResolvedValue(makePlanner(0));

		await addTag(plannerId, 'Quick');

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			{ _id: expect.any(Types.ObjectId) },
			{
				$push: {
					tags: expect.objectContaining({
						_id: expect.any(Types.ObjectId),
						name: 'Quick',
						color: 'red',
					}),
				},
			},
		);
	});

	it('returns the created tag on success', async () => {
		vi.mocked(Planner.findById).mockResolvedValue(makePlanner(0));

		const result = await addTag(plannerId, 'Quick');

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.name).toBe('Quick');
			expect(result.data.color).toBe('red');
			expect(result.data._id).toMatch(/^[0-9a-f]{24}$/);
		}
	});
});
