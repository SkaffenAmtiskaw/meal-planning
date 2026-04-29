import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { PendingInvite } from '@/_models';
import type { AccessLevel } from '@/_models/user';

import { type CancelInviteInput, cancelInvite } from './cancelInvite';

vi.mock('@/_actions/auth/checkAuth', () => ({
	checkAuth: vi.fn(),
}));

vi.mock('@/_models', () => ({
	PendingInvite: {
		findOne: vi.fn(),
		deleteOne: vi.fn(),
	},
}));

vi.mock('@/_utils/serialize', () => ({
	serialize: vi.fn((data) => data),
}));

const mockUser = {
	_id: new Types.ObjectId(),
	id: new Types.ObjectId().toString(),
	email: 'test@example.com',
	name: 'Test User',
	planners: [],
	__v: 0,
} as never;

describe('cancelInvite', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const inviteId = '507f1f77bcf86cd799439012';
	const input: CancelInviteInput = {
		inviteId,
		plannerId,
	};

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('returns error when user is not authenticated', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'unauthenticated',
		});

		const result = await cancelInvite(input);

		expect(result).toEqual({
			success: false,
			error: 'Unauthorized',
		});
		expect(checkAuth).toHaveBeenCalledWith(expect.anything(), 'admin');
		expect(PendingInvite.findOne).not.toHaveBeenCalled();
		expect(PendingInvite.deleteOne).not.toHaveBeenCalled();
	});

	it('returns error when caller lacks admin access', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'unauthorized',
		});

		const result = await cancelInvite(input);

		expect(result).toEqual({
			success: false,
			error: 'Unauthorized',
		});
		expect(PendingInvite.findOne).not.toHaveBeenCalled();
		expect(PendingInvite.deleteOne).not.toHaveBeenCalled();
	});

	it('returns error when inviteId is invalid', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockUser,
		});

		const result = await cancelInvite({
			inviteId: 'invalid-id',
			plannerId,
		});

		expect(result).toEqual({
			success: false,
			error: 'Invalid invite ID',
		});
		expect(PendingInvite.findOne).not.toHaveBeenCalled();
		expect(PendingInvite.deleteOne).not.toHaveBeenCalled();
	});

	it('returns error when invite not found for this planner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockUser,
		});

		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);

		const result = await cancelInvite(input);

		expect(result).toEqual({
			success: false,
			error: 'Invite not found',
		});
		expect(PendingInvite.findOne).toHaveBeenCalledWith({
			_id: expect.any(Types.ObjectId),
			planner: expect.any(Types.ObjectId),
		});
		expect(PendingInvite.deleteOne).not.toHaveBeenCalled();
	});

	it('successfully deletes the pending invite', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockUser,
		});

		const mockInvite = {
			_id: inviteId,
			email: 'invited@example.com',
			planner: plannerId,
			invitedBy: '507f1f77bcf86cd799439013',
			accessLevel: 'read',
			token: 'some-token',
			expiresAt: new Date(),
		};

		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(PendingInvite.deleteOne).mockResolvedValue({
			deletedCount: 1,
		} as never);

		const result = await cancelInvite(input);

		expect(result).toEqual({
			success: true,
		});
		expect(PendingInvite.findOne).toHaveBeenCalledWith({
			_id: expect.any(Types.ObjectId),
			planner: expect.any(Types.ObjectId),
		});
		expect(PendingInvite.deleteOne).toHaveBeenCalledWith({
			_id: expect.any(Types.ObjectId),
		});
	});

	it('returns error on database failure during find', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockUser,
		});

		vi.mocked(PendingInvite.findOne).mockRejectedValue(
			new Error('Database connection failed'),
		);

		const result = await cancelInvite(input);

		expect(result.success).toBe(false);
		expect(result.error).toContain('Database connection failed');
		expect(PendingInvite.deleteOne).not.toHaveBeenCalled();
	});

	it('returns error on database failure during delete', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockUser,
		});

		const mockInvite = {
			_id: inviteId,
			email: 'invited@example.com',
			planner: plannerId,
			invitedBy: '507f1f77bcf86cd799439013',
			accessLevel: 'read',
			token: 'some-token',
			expiresAt: new Date(),
		};

		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(PendingInvite.deleteOne).mockRejectedValue(
			new Error('Delete operation failed'),
		);

		const result = await cancelInvite(input);

		expect(result.success).toBe(false);
		expect(result.error).toContain('Delete operation failed');
	});

	it('returns generic error when non-Error is thrown', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockUser,
		});

		vi.mocked(PendingInvite.findOne).mockRejectedValue('String error');

		const result = await cancelInvite(input);

		expect(result.success).toBe(false);
		expect(result.error).toBe('An error occurred');
	});

	it('returns error when checkAuth returns error type', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'error',
			error: new Error('Auth check failed'),
		});

		const result = await cancelInvite(input);

		expect(result).toEqual({
			success: false,
			error: 'Unauthorized',
		});
		expect(PendingInvite.findOne).not.toHaveBeenCalled();
		expect(PendingInvite.deleteOne).not.toHaveBeenCalled();
	});

	it('verifies invite belongs to specified planner for security', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockUser,
		});

		const mockInvite = {
			_id: inviteId,
			email: 'invited@example.com',
			planner: plannerId,
			invitedBy: '507f1f77bcf86cd799439013',
			accessLevel: 'read',
			token: 'some-token',
			expiresAt: new Date(),
		};

		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(PendingInvite.deleteOne).mockResolvedValue({
			deletedCount: 1,
		} as never);

		await cancelInvite(input);

		// Verify that findOne was called with both _id and planner to ensure
		// the invite belongs to the specified planner
		const findOneCall = vi.mocked(PendingInvite.findOne).mock.calls[0][0];
		expect(findOneCall).toHaveProperty('_id');
		expect(findOneCall).toHaveProperty('planner');
	});
});
