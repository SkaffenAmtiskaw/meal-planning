import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Planner } from '@/_models/planner';
import { PendingInvite } from '@/_models/sharing';

import { validateInviteToken } from './validateInviteToken';

vi.mock(
	'@/_models/planner',
	async () => await import('@mocks/@/_models/planner'),
);
vi.mock(
	'@/_models/sharing',
	async () => await import('@mocks/@/_models/sharing'),
);

describe('validateInviteToken', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('when the invite does not exist', () => {
		it('returns invalid for a non-existent token', async () => {
			vi.mocked(PendingInvite.findOne).mockResolvedValue(null);

			const result = await validateInviteToken('non-existent-token');

			expect(PendingInvite.findOne).toHaveBeenCalledWith({
				token: 'non-existent-token',
			});
			expect(Planner.findById).not.toHaveBeenCalled();
			expect(result).toEqual({ valid: false, reason: 'invalid' });
		});

		it('returns invalid for an empty token', async () => {
			vi.mocked(PendingInvite.findOne).mockResolvedValue(null);

			const result = await validateInviteToken('');

			expect(PendingInvite.findOne).toHaveBeenCalledWith({ token: '' });
			expect(Planner.findById).not.toHaveBeenCalled();
			expect(result).toEqual({ valid: false, reason: 'invalid' });
		});

		it('returns invalid when the database query fails', async () => {
			vi.mocked(PendingInvite.findOne).mockRejectedValue(new Error('DB Error'));

			const result = await validateInviteToken('valid-token');

			expect(PendingInvite.findOne).toHaveBeenCalledWith({
				token: 'valid-token',
			});
			expect(Planner.findById).not.toHaveBeenCalled();
			expect(result).toEqual({ valid: false, reason: 'invalid' });
		});
	});

	describe('when the invite is expired', () => {
		it('returns expired with email and deletes the invite', async () => {
			const mockDeleteOne = vi.fn().mockResolvedValue(undefined);
			const mockInvite = {
				email: 'test@example.com',
				planner: 'planner123',
				expiresAt: new Date(Date.now() - 86400000),
				deleteOne: mockDeleteOne,
			};

			vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);

			const result = await validateInviteToken('expired-token');

			expect(PendingInvite.findOne).toHaveBeenCalledWith({
				token: 'expired-token',
			});
			expect(Planner.findById).not.toHaveBeenCalled();
			expect(result).toEqual({
				valid: false,
				reason: 'expired',
				email: 'test@example.com',
			});
			expect(mockDeleteOne).toHaveBeenCalled();
		});
	});

	describe('when the invite is valid', () => {
		it('returns valid with email and planner name', async () => {
			const mockInvite = {
				email: 'test@example.com',
				planner: 'planner123',
				expiresAt: new Date(Date.now() + 86400000),
				deleteOne: vi.fn(),
			};

			const mockPlanner = {
				name: 'Test Planner',
			};

			vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
			vi.mocked(Planner.findById).mockResolvedValue(mockPlanner as never);

			const result = await validateInviteToken('valid-token');

			expect(PendingInvite.findOne).toHaveBeenCalledWith({
				token: 'valid-token',
			});
			expect(Planner.findById).toHaveBeenCalledWith('planner123');
			expect(result).toEqual({
				valid: true,
				email: 'test@example.com',
				plannerName: 'Test Planner',
			});
		});

		it('returns valid with default planner name when planner is not found', async () => {
			const mockInvite = {
				email: 'test@example.com',
				planner: 'planner123',
				expiresAt: new Date(Date.now() + 86400000),
				deleteOne: vi.fn(),
			};

			vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
			vi.mocked(Planner.findById).mockResolvedValue(null);

			const result = await validateInviteToken('valid-token');

			expect(Planner.findById).toHaveBeenCalledWith('planner123');
			expect(result).toEqual({
				valid: true,
				email: 'test@example.com',
				plannerName: 'Meal Planner',
			});
		});

		it('returns valid with default planner name when planner lookup fails', async () => {
			const mockInvite = {
				email: 'test@example.com',
				planner: 'planner123',
				expiresAt: new Date(Date.now() + 86400000),
				deleteOne: vi.fn(),
			};

			vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
			vi.mocked(Planner.findById).mockRejectedValue(new Error('DB Error'));

			const result = await validateInviteToken('valid-token');

			expect(Planner.findById).toHaveBeenCalledWith('planner123');
			expect(result).toEqual({
				valid: true,
				email: 'test@example.com',
				plannerName: 'Meal Planner',
			});
		});
	});
});
