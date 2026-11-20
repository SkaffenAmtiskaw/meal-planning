import { beforeEach, describe, expect, it, vi } from 'vitest';

import { pendingInvites } from '@/_models/database/pendingInvites';
import { planners } from '@/_models/database/planners';
import { reportError } from '@/_reporting/reportError';

import { validateInviteToken } from './validateInviteToken';

vi.mock(
	'@/_reporting/reportError',
	async () => await import('#mocks/@/_reporting/reportError'),
);
vi.mock(
	'@/_models/database/planners',
	async () => await import('#mocks/@/_models/database/planners'),
);
vi.mock(
	'@/_models/database/pendingInvites',
	async () => await import('#mocks/@/_models/database/pendingInvites'),
);

describe('validateInviteToken', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('when the invite does not exist', () => {
		it('returns invalid for a non-existent token', async () => {
			vi.mocked(pendingInvites.findOne).mockResolvedValue(null);

			const result = await validateInviteToken('non-existent-token');

			expect(pendingInvites.findOne).toHaveBeenCalledWith({
				token: 'non-existent-token',
			});
			expect(planners.findOne).not.toHaveBeenCalled();
			expect(result).toEqual({ valid: false, reason: 'invalid' });
			expect(reportError).not.toHaveBeenCalled();
		});

		it('returns invalid for an empty token', async () => {
			vi.mocked(pendingInvites.findOne).mockResolvedValue(null);

			const result = await validateInviteToken('');

			expect(pendingInvites.findOne).toHaveBeenCalledWith({ token: '' });
			expect(planners.findOne).not.toHaveBeenCalled();
			expect(result).toEqual({ valid: false, reason: 'invalid' });
		});

		it('returns invalid and reports when the database query fails', async () => {
			const error = new Error('DB Error');
			vi.mocked(pendingInvites.findOne).mockRejectedValue(error);

			const result = await validateInviteToken('valid-token');

			expect(pendingInvites.findOne).toHaveBeenCalledWith({
				token: 'valid-token',
			});
			expect(planners.findOne).not.toHaveBeenCalled();
			expect(result).toEqual({ valid: false, reason: 'invalid' });
			expect(reportError).toHaveBeenCalledWith(error);
		});
	});

	describe('when the invite is expired', () => {
		it('returns expired with email and leaves the invite in place', async () => {
			const mockInvite = {
				_id: 'invite123',
				email: 'test@example.com',
				planner: 'planner123',
				expiresAt: new Date(Date.now() - 86400000),
			};

			vi.mocked(pendingInvites.findOne).mockResolvedValue(mockInvite as never);

			const result = await validateInviteToken('expired-token');

			expect(pendingInvites.findOne).toHaveBeenCalledWith({
				token: 'expired-token',
			});
			expect(planners.findOne).not.toHaveBeenCalled();
			expect(result).toEqual({
				valid: false,
				reason: 'expired',
				email: 'test@example.com',
			});
			expect(pendingInvites.deleteOne).not.toHaveBeenCalled();
		});
	});

	describe('when the invite is valid', () => {
		const mockInvite = {
			_id: 'invite123',
			email: 'test@example.com',
			planner: 'planner123',
			expiresAt: new Date(Date.now() + 86400000),
		};

		it('returns valid with email and planner name', async () => {
			vi.mocked(pendingInvites.findOne).mockResolvedValue(mockInvite as never);
			vi.mocked(planners.findOne).mockResolvedValue({
				name: 'Test Planner',
			} as never);

			const result = await validateInviteToken('valid-token');

			expect(pendingInvites.findOne).toHaveBeenCalledWith({
				token: 'valid-token',
			});
			expect(planners.findOne).toHaveBeenCalledWith({ _id: 'planner123' });
			expect(pendingInvites.deleteOne).not.toHaveBeenCalled();
			expect(result).toEqual({
				valid: true,
				email: 'test@example.com',
				plannerName: 'Test Planner',
			});
		});

		it('returns valid with default planner name when planner is not found', async () => {
			vi.mocked(pendingInvites.findOne).mockResolvedValue(mockInvite as never);
			vi.mocked(planners.findOne).mockResolvedValue(null as never);

			const result = await validateInviteToken('valid-token');

			expect(planners.findOne).toHaveBeenCalledWith({ _id: 'planner123' });
			expect(result).toEqual({
				valid: true,
				email: 'test@example.com',
				plannerName: 'Meal Planner',
			});
		});

		it('returns valid with default planner name, and reports, when planner lookup fails', async () => {
			const error = new Error('DB Error');

			vi.mocked(pendingInvites.findOne).mockResolvedValue(mockInvite as never);
			vi.mocked(planners.findOne).mockRejectedValue(error);

			const result = await validateInviteToken('valid-token');

			expect(planners.findOne).toHaveBeenCalledWith({ _id: 'planner123' });
			expect(result).toEqual({
				valid: true,
				email: 'test@example.com',
				plannerName: 'Meal Planner',
			});
			expect(reportError).toHaveBeenCalledWith(error);
		});
	});
});
