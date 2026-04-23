import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { removePlannerMembership } from '@/_actions/planner/_utils/removePlannerMembership';
import { User } from '@/_models';
import type { AccessLevel } from '@/_models/user';

import { removeMember } from './removeMember';

vi.mock('@/_actions/auth/checkAuth', () => ({
	checkAuth: vi.fn(),
}));

vi.mock('@/_models', () => ({
	User: {
		findOne: vi.fn(),
	},
}));

vi.mock('@/_actions/planner/_utils/removePlannerMembership', () => ({
	removePlannerMembership: vi.fn(),
}));

describe('removeMember', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const memberEmail = 'member@example.com';
	const targetUserId = 'target-user-id';

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('removes member when caller is owner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner' as AccessLevel,
		});

		const mockTargetUser = {
			_id: targetUserId,
			email: memberEmail,
			name: 'Target User',
			planners: [
				{
					planner: { toString: () => plannerId },
					accessLevel: 'write',
				},
			],
		};

		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser as never);
		vi.mocked(removePlannerMembership).mockResolvedValue({ ok: true });

		const result = await removeMember(plannerId, memberEmail);

		expect(result).toEqual({ ok: true });
		expect(checkAuth).toHaveBeenCalledWith(expect.anything(), 'admin');
		expect(User.findOne).toHaveBeenCalledWith({ email: memberEmail });
		expect(removePlannerMembership).toHaveBeenCalledWith(
			targetUserId,
			plannerId,
		);
	});

	it('removes member when caller is admin', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
		});

		const mockTargetUser = {
			_id: targetUserId,
			email: memberEmail,
			name: 'Target User',
			planners: [
				{
					planner: { toString: () => plannerId },
					accessLevel: 'read',
				},
			],
		};

		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser as never);
		vi.mocked(removePlannerMembership).mockResolvedValue({ ok: true });

		const result = await removeMember(plannerId, memberEmail);

		expect(result).toEqual({ ok: true });
		expect(removePlannerMembership).toHaveBeenCalledWith(
			targetUserId,
			plannerId,
		);
	});

	it('returns unauthorized error when caller lacks permission', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'unauthorized',
		});

		const result = await removeMember(plannerId, memberEmail);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(User.findOne).not.toHaveBeenCalled();
		expect(removePlannerMembership).not.toHaveBeenCalled();
	});

	it('returns error when target user not found', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner' as AccessLevel,
		});

		vi.mocked(User.findOne).mockResolvedValue(null);

		const result = await removeMember(plannerId, memberEmail);

		expect(result).toEqual({ ok: false, error: 'User not found' });
		expect(removePlannerMembership).not.toHaveBeenCalled();
	});

	it('returns error when target user is not a member', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner' as AccessLevel,
		});

		const mockTargetUser = {
			_id: targetUserId,
			email: memberEmail,
			name: 'Target User',
			planners: [
				{
					planner: { toString: () => 'other-planner-id' },
					accessLevel: 'admin',
				},
			],
		};

		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser as never);

		const result = await removeMember(plannerId, memberEmail);

		expect(result).toEqual({
			ok: false,
			error: 'User is not a member of this planner',
		});
		expect(removePlannerMembership).not.toHaveBeenCalled();
	});

	it('returns error when trying to remove an owner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner' as AccessLevel,
		});

		const mockTargetUser = {
			_id: targetUserId,
			email: memberEmail,
			name: 'Target User',
			planners: [
				{
					planner: { toString: () => plannerId },
					accessLevel: 'owner',
				},
			],
		};

		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser as never);

		const result = await removeMember(plannerId, memberEmail);

		expect(result).toEqual({ ok: false, error: 'Cannot remove owner' });
		expect(removePlannerMembership).not.toHaveBeenCalled();
	});

	it('returns error when removePlannerMembership fails', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner' as AccessLevel,
		});

		const mockTargetUser = {
			_id: targetUserId,
			email: memberEmail,
			name: 'Target User',
			planners: [
				{
					planner: { toString: () => plannerId },
					accessLevel: 'admin',
				},
			],
		};

		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser as never);
		vi.mocked(removePlannerMembership).mockResolvedValue({
			ok: false,
			error: 'Membership removal failed',
		});

		const result = await removeMember(plannerId, memberEmail);

		expect(result).toEqual({
			ok: false,
			error: 'Membership removal failed',
		});
	});

	it('returns unauthorized error when caller is unauthenticated', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'unauthenticated',
		});

		const result = await removeMember(plannerId, memberEmail);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(User.findOne).not.toHaveBeenCalled();
		expect(removePlannerMembership).not.toHaveBeenCalled();
	});

	it('returns unauthorized error when checkAuth returns error', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'error',
			error: new Error('Auth check failed'),
		});

		const result = await removeMember(plannerId, memberEmail);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(User.findOne).not.toHaveBeenCalled();
		expect(removePlannerMembership).not.toHaveBeenCalled();
	});
});
