import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/_models/user', async () => await import('@mocks/@/_models/user'));

import { User } from '@/_models/user';

import { removePlannerMembership } from './removePlannerMembership';

describe('removePlannerMembership', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('success', () => {
		it('removes membership from user.planners array when given string IDs', async () => {
			const userId = new Types.ObjectId().toString();
			const plannerId = new Types.ObjectId().toString();

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

			const result = await removePlannerMembership(userId, plannerId);

			expect(result).toEqual({ ok: true });
		});

		it('accepts ObjectId types as well as strings', async () => {
			const userId = new Types.ObjectId();
			const plannerId = new Types.ObjectId();

			const result = await removePlannerMembership(userId, plannerId);

			expect(result).toEqual({ ok: true });
			expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
				$pull: {
					planners: { planner: plannerId },
				},
			});
		});
	});

	describe('error', () => {
		it('returns ok: false with error message when database throws an Error', async () => {
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

		it('returns ok: false with error message when database throws a non-Error value', async () => {
			const userId = new Types.ObjectId().toString();
			const plannerId = new Types.ObjectId().toString();

			vi.mocked(User.findByIdAndUpdate).mockRejectedValue(
				'String error message',
			);

			const result = await removePlannerMembership(userId, plannerId);

			expect(result).toEqual({
				ok: false,
				error: 'String error message',
			});
		});
	});
});
