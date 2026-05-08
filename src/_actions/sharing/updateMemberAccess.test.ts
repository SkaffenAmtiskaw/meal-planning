import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth';
import type { AccessLevel } from '@/_models/user';
import { User } from '@/_models/user';

import { updateMemberAccess } from './updateMemberAccess';

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));
vi.mock('@/_models/user', async () => await import('@mocks/@/_models/user'));

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
		} as never,
	});

	const mockTargetUser = (
		accessLevel: AccessLevel,
		plannerIdOverride?: string,
	) =>
		({
			_id: targetUserId,
			email: targetUserEmail,
			name: 'Target User',
			planners: [
				{
					planner: { toString: () => plannerIdOverride ?? plannerId },
					accessLevel,
				},
			],
		}) as never;

	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('when caller is not authenticated', () => {
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
	});

	describe('when caller has insufficient permissions', () => {
		it('prevents read access users from changing access', async () => {
			vi.mocked(checkAuth).mockResolvedValue(mockAuthorizedUser('read'));

			const result = await updateMemberAccess(
				plannerId,
				targetUserEmail,
				'write',
			);

			expect(result).toEqual({ ok: false, error: 'Insufficient permissions' });
			expect(User.findOne).not.toHaveBeenCalled();
		});

		it('prevents write access users from changing access', async () => {
			vi.mocked(checkAuth).mockResolvedValue(mockAuthorizedUser('write'));

			const result = await updateMemberAccess(
				plannerId,
				targetUserEmail,
				'read',
			);

			expect(result).toEqual({ ok: false, error: 'Insufficient permissions' });
			expect(User.findOne).not.toHaveBeenCalled();
		});
	});

	describe('when target user is invalid', () => {
		it('returns error when target user is not found', async () => {
			vi.mocked(checkAuth).mockResolvedValue(mockAuthorizedUser('owner'));
			vi.mocked(User.findOne as any).mockResolvedValue(null);

			const result = await updateMemberAccess(
				plannerId,
				targetUserEmail,
				'write',
			);

			expect(result).toEqual({ ok: false, error: 'User not found' });
			expect(User.updateOne).not.toHaveBeenCalled();
		});

		it('prevents changing non-member access', async () => {
			vi.mocked(checkAuth).mockResolvedValue(mockAuthorizedUser('owner'));
			vi.mocked(User.findOne as any).mockResolvedValue(
				mockTargetUser('admin', 'other-planner-id'),
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
	});

	describe('when target access level cannot be changed', () => {
		it('prevents changing owner access', async () => {
			vi.mocked(checkAuth).mockResolvedValue(mockAuthorizedUser('owner'));
			vi.mocked(User.findOne as any).mockResolvedValue(mockTargetUser('owner'));

			const result = await updateMemberAccess(
				plannerId,
				targetUserEmail,
				'admin',
			);

			expect(result).toEqual({
				ok: false,
				error: 'Cannot change owner access',
			});
			expect(User.updateOne).not.toHaveBeenCalled();
		});

		it('prevents admin from changing other admin access', async () => {
			vi.mocked(checkAuth).mockResolvedValue(mockAuthorizedUser('admin'));
			vi.mocked(User.findOne as any).mockResolvedValue(mockTargetUser('admin'));

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

		it('prevents admin from changing owner access', async () => {
			vi.mocked(checkAuth).mockResolvedValue(mockAuthorizedUser('admin'));
			vi.mocked(User.findOne as any).mockResolvedValue(mockTargetUser('owner'));

			const result = await updateMemberAccess(
				plannerId,
				targetUserEmail,
				'admin',
			);

			expect(result).toEqual({
				ok: false,
				error: 'Cannot change owner access',
			});
			expect(User.updateOne).not.toHaveBeenCalled();
		});
	});

	describe('when caller has sufficient permissions', () => {
		it('allows owner to change admin access to write', async () => {
			vi.mocked(checkAuth).mockResolvedValue(mockAuthorizedUser('owner'));
			vi.mocked(User.findOne as any).mockResolvedValue(mockTargetUser('admin'));

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
			vi.mocked(checkAuth).mockResolvedValue(mockAuthorizedUser('owner'));
			vi.mocked(User.findOne as any).mockResolvedValue(mockTargetUser('write'));

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
			vi.mocked(checkAuth).mockResolvedValue(mockAuthorizedUser('admin'));
			vi.mocked(User.findOne as any).mockResolvedValue(mockTargetUser('write'));

			const result = await updateMemberAccess(
				plannerId,
				targetUserEmail,
				'read',
			);

			expect(result).toEqual({ ok: true });
			expect(User.updateOne).toHaveBeenCalledWith(
				{ _id: targetUserId, 'planners.planner': plannerId },
				{ $set: { 'planners.$.accessLevel': 'read' } },
			);
		});

		it('allows admin to change read access to write', async () => {
			vi.mocked(checkAuth).mockResolvedValue(mockAuthorizedUser('admin'));
			vi.mocked(User.findOne as any).mockResolvedValue(mockTargetUser('read'));

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
	});
});
