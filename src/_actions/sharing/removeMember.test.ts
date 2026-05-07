import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth';
import { User } from '@/_models/user';

import { removeMember } from './removeMember';

import { removePlannerMembership } from './_utils/removePlannerMembership';

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));

vi.mock('@/_models/user', () => ({
	User: {
		findOne: vi.fn(),
	},
}));
vi.mock('./_utils/removePlannerMembership', () => ({
	removePlannerMembership: vi.fn(),
}));

describe('removeMember', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const memberEmail = 'member@example.com';
	const targetUserId = 'target-user-id';

	const targetUser = {
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

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('removes member when caller is authorized', async () => {
		vi.mocked(User.findOne).mockResolvedValue(targetUser as never);
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

	it.each([
		{ type: 'unauthorized' as const },
		{ type: 'unauthenticated' as const },
		{ type: 'error' as const, error: new Error('Auth check failed') },
	])('returns unauthorized error when auth result is $type', async (authValue) => {
		vi.mocked(checkAuth).mockResolvedValue(authValue as never);

		const result = await removeMember(plannerId, memberEmail);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(User.findOne).not.toHaveBeenCalled();
		expect(removePlannerMembership).not.toHaveBeenCalled();
	});

	it('returns error when target user not found', async () => {
		vi.mocked(User.findOne).mockResolvedValue(null);

		const result = await removeMember(plannerId, memberEmail);

		expect(result).toEqual({ ok: false, error: 'User not found' });
		expect(removePlannerMembership).not.toHaveBeenCalled();
	});

	it('returns error when target user is not a member', async () => {
		const nonMember = {
			...targetUser,
			planners: [
				{
					planner: { toString: () => 'other-planner-id' },
					accessLevel: 'admin',
				},
			],
		};

		vi.mocked(User.findOne).mockResolvedValue(nonMember as never);

		const result = await removeMember(plannerId, memberEmail);

		expect(result).toEqual({
			ok: false,
			error: 'User is not a member of this planner',
		});
		expect(removePlannerMembership).not.toHaveBeenCalled();
	});

	it('returns error when trying to remove an owner', async () => {
		const owner = {
			...targetUser,
			planners: [
				{
					planner: { toString: () => plannerId },
					accessLevel: 'owner',
				},
			],
		};

		vi.mocked(User.findOne).mockResolvedValue(owner as never);

		const result = await removeMember(plannerId, memberEmail);

		expect(result).toEqual({ ok: false, error: 'Cannot remove owner' });
		expect(removePlannerMembership).not.toHaveBeenCalled();
	});

	it('returns error when removePlannerMembership fails', async () => {
		vi.mocked(User.findOne).mockResolvedValue(targetUser as never);
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
});
