import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth';
import type { AccessLevel } from '@/_models/user';
import { User } from '@/_models/user';

import { updateMemberAccess } from './updateMemberAccess';

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));

vi.mock('@/_models/user', () => ({
	User: {
		findOne: vi.fn(),
		updateOne: vi.fn(),
	},
}));

describe('updateMemberAccess', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const targetUserEmail = 'target@example.com';
	const targetUserId = 'target-user-id';

	const mockAuthorizedUser = (accessLevel: AccessLevel) => ({
		type: 'authorized' as const,
		accessLevel,
		user: {
			_id: 'caller-user-id',
			email: 'caller@example.com',
			name: 'Caller User',
			planners: [],
		},
	});

	const mockTargetUser = (
		accessLevel: AccessLevel,
		plannerIdOverride?: string,
	) => ({
		_id: targetUserId,
		email: targetUserEmail,
		name: 'Target User',
		planners: [
			{
				planner: { toString: () => plannerIdOverride ?? plannerId },
				accessLevel,
			},
		],
	});

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('allows owner to change admin access to write', async () => {
		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser('admin') as never);

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'write',
		);

		expect(result).toEqual({ ok: true });
		expect(User.updateOne).toHaveBeenCalledWith(
			{ _id: targetUserId, 'planners.planner': plannerId },
			{ $set: { 'planners.$.accessLevel': 'write' } },
		);
	});

	it('allows owner to change write access to admin', async () => {
		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser('write') as never);

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'admin',
		);

		expect(result).toEqual({ ok: true });
		expect(User.updateOne).toHaveBeenCalledWith(
			{ _id: targetUserId, 'planners.planner': plannerId },
			{ $set: { 'planners.$.accessLevel': 'admin' } },
		);
	});

	it('allows admin to change write access to read', async () => {
		vi.mocked(checkAuth).mockResolvedValue(
			mockAuthorizedUser('admin') as never,
		);
		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser('write') as never);

		const result = await updateMemberAccess(plannerId, targetUserEmail, 'read');

		expect(result).toEqual({ ok: true });
	});

	it('allows admin to change read access to write', async () => {
		vi.mocked(checkAuth).mockResolvedValue(
			mockAuthorizedUser('admin') as never,
		);
		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser('read') as never);

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'write',
		);

		expect(result).toEqual({ ok: true });
	});

	it('prevents admin from changing other admin access', async () => {
		vi.mocked(checkAuth).mockResolvedValue(
			mockAuthorizedUser('admin') as never,
		);
		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser('admin') as never);

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'write',
		);

		expect(result).toEqual({
			ok: false,
			error: 'Admins cannot modify other admins',
		});
		expect(User.updateOne).not.toHaveBeenCalled();
	});

	it('prevents changing owner access', async () => {
		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser('owner') as never);

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'admin',
		);

		expect(result).toEqual({ ok: false, error: 'Cannot change owner access' });
		expect(User.updateOne).not.toHaveBeenCalled();
	});

	it('prevents changing non-member access', async () => {
		vi.mocked(User.findOne).mockResolvedValue(
			mockTargetUser('admin', 'other-planner-id') as never,
		);

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'write',
		);

		expect(result).toEqual({
			ok: false,
			error: 'User is not a member of this planner',
		});
		expect(User.updateOne).not.toHaveBeenCalled();
	});

	it('returns unauthorized for unauthenticated users', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthenticated' });

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'write',
		);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(User.findOne).not.toHaveBeenCalled();
	});

	it('returns unauthorized for unauthorized users', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthorized' });

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'write',
		);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(User.findOne).not.toHaveBeenCalled();
	});

	it('returns unauthorized when checkAuth returns error', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'error',
			error: new Error('Auth check failed'),
		});

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'write',
		);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(User.findOne).not.toHaveBeenCalled();
	});

	it('returns error when target user is not found', async () => {
		vi.mocked(User.findOne).mockResolvedValue(null);

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'write',
		);

		expect(result).toEqual({ ok: false, error: 'User not found' });
		expect(User.updateOne).not.toHaveBeenCalled();
	});

	it('prevents read access users from changing access', async () => {
		vi.mocked(checkAuth).mockResolvedValue(mockAuthorizedUser('read') as never);

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'write',
		);

		expect(result).toEqual({ ok: false, error: 'Insufficient permissions' });
		expect(User.findOne).not.toHaveBeenCalled();
	});

	it('prevents write access users from changing access', async () => {
		vi.mocked(checkAuth).mockResolvedValue(
			mockAuthorizedUser('write') as never,
		);

		const result = await updateMemberAccess(plannerId, targetUserEmail, 'read');

		expect(result).toEqual({ ok: false, error: 'Insufficient permissions' });
		expect(User.findOne).not.toHaveBeenCalled();
	});

	it('prevents admin from changing owner access', async () => {
		vi.mocked(checkAuth).mockResolvedValue(
			mockAuthorizedUser('admin') as never,
		);
		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser('owner') as never);

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'admin',
		);

		expect(result).toEqual({ ok: false, error: 'Cannot change owner access' });
		expect(User.updateOne).not.toHaveBeenCalled();
	});
});
