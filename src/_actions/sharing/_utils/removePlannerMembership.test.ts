import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/_models', () => ({
	User: {
		findByIdAndUpdate: vi.fn(),
	},
}));

import { User } from '@/_models';

import { removePlannerMembership } from './removePlannerMembership';

describe('removePlannerMembership', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('removes membership from user.planners array', async () => {
		const userId = new Types.ObjectId().toString();
		const plannerId = new Types.ObjectId().toString();

		vi.mocked(User.findByIdAndUpdate).mockResolvedValue({});

		await removePlannerMembership(userId, plannerId);

		expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
			$pull: {
				planners: { planner: new Types.ObjectId(plannerId) },
			},
		});
	});

	it('returns ok: true on successful removal', async () => {
		const userId = new Types.ObjectId().toString();
		const plannerId = new Types.ObjectId().toString();

		vi.mocked(User.findByIdAndUpdate).mockResolvedValue({});

		const result = await removePlannerMembership(userId, plannerId);

		expect(result).toEqual({ ok: true });
	});

	it('handles database errors gracefully', async () => {
		const userId = new Types.ObjectId().toString();
		const plannerId = new Types.ObjectId().toString();

		vi.mocked(User.findByIdAndUpdate).mockRejectedValue(
			new Error('Database connection failed'),
		);

		const result = await removePlannerMembership(userId, plannerId);

		expect(result).toEqual({
			ok: false,
			error: 'Database connection failed',
		});
	});

	it('handles non-Error exceptions', async () => {
		const userId = new Types.ObjectId().toString();
		const plannerId = new Types.ObjectId().toString();

		vi.mocked(User.findByIdAndUpdate).mockRejectedValue('String error message');

		const result = await removePlannerMembership(userId, plannerId);

		expect(result).toEqual({
			ok: false,
			error: 'String error message',
		});
	});

	it('accepts ObjectId types as well as strings', async () => {
		const userId = new Types.ObjectId();
		const plannerId = new Types.ObjectId();

		vi.mocked(User.findByIdAndUpdate).mockResolvedValue({});

		const result = await removePlannerMembership(userId, plannerId);

		expect(result).toEqual({ ok: true });
		expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
			$pull: {
				planners: { planner: plannerId },
			},
		});
	});
});
