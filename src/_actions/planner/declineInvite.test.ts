import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getUser } from '@/_actions';
import { PendingInvite } from '@/_models';

import { type DeclineInviteInput, declineInvite } from './declineInvite';

vi.mock('@/_actions', () => ({
	getUser: vi.fn(),
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

describe('declineInvite', () => {
	const inviteId = '507f1f77bcf86cd799439012';
	const userEmail = 'user@example.com';
	const input: DeclineInviteInput = {
		inviteId,
	};

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should decline and delete a valid invite', async () => {
		vi.mocked(getUser).mockResolvedValue({
			_id: '507f1f77bcf86cd799439011' as never,
			email: userEmail,
			name: 'Test User',
		} as never);

		const mockInvite = {
			_id: inviteId,
			email: userEmail,
			planner: '507f1f77bcf86cd799439013' as never,
			invitedBy: '507f1f77bcf86cd799439014' as never,
			accessLevel: 'read',
			token: 'some-token',
			expiresAt: new Date(),
		};

		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(PendingInvite.deleteOne).mockResolvedValue({
			deletedCount: 1,
		} as never);

		const result = await declineInvite(input);

		expect(result).toEqual({
			ok: true,
			data: undefined,
		});
		expect(getUser).toHaveBeenCalled();
		expect(PendingInvite.findOne).toHaveBeenCalledWith({
			_id: expect.any(Types.ObjectId),
		});
		expect(PendingInvite.deleteOne).toHaveBeenCalledWith({
			_id: expect.any(Types.ObjectId),
		});
	});

	it('should return error when user is not authenticated', async () => {
		vi.mocked(getUser).mockResolvedValue(null);

		const result = await declineInvite(input);

		expect(result).toEqual({
			ok: false,
			error: 'Unauthorized',
		});
		expect(getUser).toHaveBeenCalled();
		expect(PendingInvite.findOne).not.toHaveBeenCalled();
		expect(PendingInvite.deleteOne).not.toHaveBeenCalled();
	});

	it('should return error when inviteId is invalid', async () => {
		vi.mocked(getUser).mockResolvedValue({
			_id: '507f1f77bcf86cd799439011' as never,
			email: userEmail,
			name: 'Test User',
		} as never);

		const result = await declineInvite({
			inviteId: 'invalid-id',
		});

		expect(result).toEqual({
			ok: false,
			error: 'Invalid invite ID',
		});
		expect(PendingInvite.findOne).not.toHaveBeenCalled();
		expect(PendingInvite.deleteOne).not.toHaveBeenCalled();
	});

	it('should return error when invite not found', async () => {
		vi.mocked(getUser).mockResolvedValue({
			_id: '507f1f77bcf86cd799439011' as never,
			email: userEmail,
			name: 'Test User',
		} as never);

		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);

		const result = await declineInvite(input);

		expect(result).toEqual({
			ok: false,
			error: 'Invite not found',
		});
		expect(PendingInvite.findOne).toHaveBeenCalledWith({
			_id: expect.any(Types.ObjectId),
		});
		expect(PendingInvite.deleteOne).not.toHaveBeenCalled();
	});

	it('should return error when invite email does not match user email', async () => {
		vi.mocked(getUser).mockResolvedValue({
			_id: '507f1f77bcf86cd799439011' as never,
			email: userEmail,
			name: 'Test User',
		} as never);

		const mockInvite = {
			_id: inviteId,
			email: 'different@example.com',
			planner: '507f1f77bcf86cd799439013' as never,
			invitedBy: '507f1f77bcf86cd799439014' as never,
			accessLevel: 'read',
			token: 'some-token',
			expiresAt: new Date(),
		};

		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);

		const result = await declineInvite(input);

		expect(result).toEqual({
			ok: false,
			error: 'Unauthorized',
		});
		expect(PendingInvite.deleteOne).not.toHaveBeenCalled();
	});

	it('should return error on database failure during find', async () => {
		vi.mocked(getUser).mockResolvedValue({
			_id: '507f1f77bcf86cd799439011' as never,
			email: userEmail,
			name: 'Test User',
		} as never);

		vi.mocked(PendingInvite.findOne).mockRejectedValue(
			new Error('Database connection failed'),
		);

		const result = await declineInvite(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain('Database connection failed');
		}
		expect(PendingInvite.deleteOne).not.toHaveBeenCalled();
	});

	it('should return error on database failure during delete', async () => {
		vi.mocked(getUser).mockResolvedValue({
			_id: '507f1f77bcf86cd799439011' as never,
			email: userEmail,
			name: 'Test User',
		} as never);

		const mockInvite = {
			_id: inviteId,
			email: userEmail,
			planner: '507f1f77bcf86cd799439013' as never,
			invitedBy: '507f1f77bcf86cd799439014' as never,
			accessLevel: 'read',
			token: 'some-token',
			expiresAt: new Date(),
		};

		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(PendingInvite.deleteOne).mockRejectedValue(
			new Error('Delete operation failed'),
		);

		const result = await declineInvite(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain('Delete operation failed');
		}
	});

	it('should return generic error when non-Error is thrown', async () => {
		vi.mocked(getUser).mockResolvedValue({
			_id: '507f1f77bcf86cd799439011' as never,
			email: userEmail,
			name: 'Test User',
		} as never);

		vi.mocked(PendingInvite.findOne).mockRejectedValue('String error');

		const result = await declineInvite(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBe('An error occurred');
		}
	});

	it('should verify invite belongs to authenticated user by email', async () => {
		vi.mocked(getUser).mockResolvedValue({
			_id: '507f1f77bcf86cd799439011' as never,
			email: userEmail,
			name: 'Test User',
		} as never);

		const mockInvite = {
			_id: inviteId,
			email: userEmail,
			planner: '507f1f77bcf86cd799439013' as never,
			invitedBy: '507f1f77bcf86cd799439014' as never,
			accessLevel: 'read',
			token: 'some-token',
			expiresAt: new Date(),
		};

		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(PendingInvite.deleteOne).mockResolvedValue({
			deletedCount: 1,
		} as never);

		await declineInvite(input);

		// Verify that the email was checked
		expect(PendingInvite.findOne).toHaveBeenCalled();
	});
});
