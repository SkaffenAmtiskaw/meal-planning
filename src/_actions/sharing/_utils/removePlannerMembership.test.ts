import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/_models/user', async () => await import('#mocks/@/_models/user'));
vi.mock(
	'@/_utils/reportError',
	async () => await import('#mocks/@/_utils/reportError'),
);

import { newId } from '@/_models/database/newId';
import { User } from '@/_models/user';
import { reportError } from '@/_utils/reportError';

import { removePlannerMembership } from './removePlannerMembership';

describe('removePlannerMembership', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('success', () => {
		it('removes membership from user.planners array when given string IDs', async () => {
			const userId = newId();
			const plannerId = newId();

			await removePlannerMembership(userId, plannerId);

			expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
				$pull: {
					planners: { planner: plannerId },
				},
			});
		});

		it('returns ok: true on successful removal, and reports nothing', async () => {
			const userId = newId();
			const plannerId = newId();

			const result = await removePlannerMembership(userId, plannerId);

			expect(reportError).not.toHaveBeenCalled();

			expect(result).toEqual({ ok: true });
		});
	});

	describe('error', () => {
		it('returns ok: false with error message when database throws an Error', async () => {
			const userId = newId();
			const plannerId = newId();

			const error = new Error('Database connection failed');
			vi.mocked(User.findByIdAndUpdate).mockRejectedValue(error);

			const result = await removePlannerMembership(userId, plannerId);

			expect(result).toEqual({
				ok: false,
				error: 'Database connection failed',
			});
			expect(reportError).toHaveBeenCalledWith(error);
		});

		it('returns ok: false with error message when database throws a non-Error value', async () => {
			const userId = newId();
			const plannerId = newId();

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
