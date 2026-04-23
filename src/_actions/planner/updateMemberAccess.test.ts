import { beforeEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { User } from '@/_models';
import type { AccessLevel } from '@/_models/user';

import { updateMemberAccess } from './updateMemberAccess';

vi.mock('@/_actions/auth/checkAuth', () => ({
	checkAuth: vi.fn(),
}));

vi.mock('@/_models', () => ({
	User: {
		findOne: vi.fn(),
		updateOne: vi.fn(),
	},
}));

describe('updateMemberAccess', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const targetUserEmail = 'target@example.com';

	beforeEach(() => {
		vi.resetAllMocks();
	});

	test('owner can change admin to write', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner' as AccessLevel,
		});

		const mockTargetUser = {
			_id: 'target-user-id',
			email: targetUserEmail,
			name: 'Target User',
			planners: [
				{
					planner: { toString: () => plannerId },
					accessLevel: 'admin',
				},
			],
		};

		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser as never);
		vi.mocked(User.updateOne).mockResolvedValue({
			acknowledged: true,
		} as never);

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'write',
		);

		expect(result).toEqual({ ok: true });
		expect(User.updateOne).toHaveBeenCalledWith(
			{ _id: 'target-user-id', 'planners.planner': plannerId },
			{ $set: { 'planners.$.accessLevel': 'write' } },
		);
	});

	test('owner can change write to admin', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner' as AccessLevel,
		});

		const mockTargetUser = {
			_id: 'target-user-id',
			email: targetUserEmail,
			name: 'Target User',
			planners: [
				{
					planner: { toString: () => plannerId },
					accessLevel: 'write',
				},
			],
		};

		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser as never);
		vi.mocked(User.updateOne).mockResolvedValue({
			acknowledged: true,
		} as never);

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'admin',
		);

		expect(result).toEqual({ ok: true });
		expect(User.updateOne).toHaveBeenCalledWith(
			{ _id: 'target-user-id', 'planners.planner': plannerId },
			{ $set: { 'planners.$.accessLevel': 'admin' } },
		);
	});

	test('admin can change write to read', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
		});

		const mockTargetUser = {
			_id: 'target-user-id',
			email: targetUserEmail,
			name: 'Target User',
			planners: [
				{
					planner: { toString: () => plannerId },
					accessLevel: 'write',
				},
			],
		};

		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser as never);
		vi.mocked(User.updateOne).mockResolvedValue({
			acknowledged: true,
		} as never);

		const result = await updateMemberAccess(plannerId, targetUserEmail, 'read');

		expect(result).toEqual({ ok: true });
	});

	test('admin can change read to write', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
		});

		const mockTargetUser = {
			_id: 'target-user-id',
			email: targetUserEmail,
			name: 'Target User',
			planners: [
				{
					planner: { toString: () => plannerId },
					accessLevel: 'write',
				},
			],
		};

		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser as never);
		vi.mocked(User.updateOne).mockResolvedValue({
			acknowledged: true,
		} as never);

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'write',
		);

		expect(result).toEqual({ ok: true });
	});

	test('admin CANNOT change admin to write', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
		});

		const mockTargetUser = {
			_id: 'target-user-id',
			email: targetUserEmail,
			name: 'Target User',
			planners: [
				{
					planner: { toString: () => plannerId },
					accessLevel: 'admin',
				},
			],
		};

		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser as never);

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

	test('cannot change owner access', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner' as AccessLevel,
		});

		const mockTargetUser = {
			_id: 'target-user-id',
			email: targetUserEmail,
			name: 'Target User',
			planners: [
				{
					planner: { toString: () => plannerId },
					accessLevel: 'owner',
				},
			],
		};

		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser as never);

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'admin',
		);

		expect(result).toEqual({ ok: false, error: 'Cannot change owner access' });
		expect(User.updateOne).not.toHaveBeenCalled();
	});

	test('cannot change non-member access', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner' as AccessLevel,
		});

		const mockTargetUser = {
			_id: 'target-user-id',
			email: targetUserEmail,
			name: 'Target User',
			planners: [
				{
					planner: { toString: () => 'other-planner-id' },
					accessLevel: 'admin',
				},
			],
		};

		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser as never);

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

	test('unauthorized users rejected', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'unauthorized',
		});

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'write',
		);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(User.findOne).not.toHaveBeenCalled();
	});

	test('unauthenticated users rejected', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'unauthenticated',
		});

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'write',
		);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(User.findOne).not.toHaveBeenCalled();
	});

	test('target user not found', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner' as AccessLevel,
		});

		vi.mocked(User.findOne).mockResolvedValue(null);

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'write',
		);

		expect(result).toEqual({ ok: false, error: 'User not found' });
		expect(User.updateOne).not.toHaveBeenCalled();
	});

	test('read access users cannot change access', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'read' as AccessLevel,
		});

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'write',
		);

		expect(result).toEqual({ ok: false, error: 'Insufficient permissions' });
		expect(User.findOne).not.toHaveBeenCalled();
	});

	test('write access users cannot change access', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'write' as AccessLevel,
		});

		const result = await updateMemberAccess(plannerId, targetUserEmail, 'read');

		expect(result).toEqual({ ok: false, error: 'Insufficient permissions' });
		expect(User.findOne).not.toHaveBeenCalled();
	});

	test('admin cannot change owner access', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
		});

		const mockTargetUser = {
			_id: 'target-user-id',
			email: targetUserEmail,
			name: 'Target User',
			planners: [
				{
					planner: { toString: () => plannerId },
					accessLevel: 'owner',
				},
			],
		};

		vi.mocked(User.findOne).mockResolvedValue(mockTargetUser as never);

		const result = await updateMemberAccess(
			plannerId,
			targetUserEmail,
			'admin',
		);

		expect(result).toEqual({ ok: false, error: 'Cannot change owner access' });
		expect(User.updateOne).not.toHaveBeenCalled();
	});

	test('handles checkAuth error', async () => {
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
