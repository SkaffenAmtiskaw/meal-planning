import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getUser } from '@/_actions';
import { PendingInvite, User } from '@/_models';
import type { AccessLevel } from '@/_models/user';

import { acceptInvite } from './acceptInvite';

vi.mock('@/_actions', () => ({
	getUser: vi.fn(),
}));

vi.mock('@/_models', () => ({
	PendingInvite: {
		findOne: vi.fn(),
		deleteOne: vi.fn(),
	},
	User: {
		findOne: vi.fn(),
		updateOne: vi.fn(),
	},
}));

vi.mock('@/_utils/serialize', () => ({
	serialize: vi.fn((data) => data),
}));

describe('acceptInvite', () => {
	const token = 'valid-token-123';
	const userId = '507f1f77bcf86cd799439011';
	const userEmail = 'user@example.com';
	const plannerId = '507f1f77bcf86cd799439012';
	const mockNow = new Date('2024-01-15T00:00:00.000Z');

	beforeEach(() => {
		vi.resetAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(mockNow);
	});

	it('should accept a valid invite and add user to planner', async () => {
		// Mock authenticated user
		vi.mocked(getUser).mockResolvedValue({
			_id: userId as never,
			email: userEmail,
			name: 'Test User',
			planners: [],
		} as never);

		// Mock valid pending invite
		const mockDeleteOne = vi.fn().mockResolvedValue({ deletedCount: 1 });
		vi.mocked(PendingInvite.findOne).mockResolvedValue({
			_id: 'invite-id' as never,
			email: userEmail,
			planner: { toString: () => plannerId },
			accessLevel: 'write',
			token,
			expiresAt: new Date('2024-01-20T00:00:00.000Z'), // Future date
			deleteOne: mockDeleteOne,
		} as never);

		// Mock successful user update
		vi.mocked(User.updateOne).mockResolvedValue({
			acknowledged: true,
			matchedCount: 1,
			modifiedCount: 1,
		} as never);

		const result = await acceptInvite({ token });

		expect(result).toEqual({
			ok: true,
			data: { plannerId },
		});
		expect(getUser).toHaveBeenCalled();
		expect(PendingInvite.findOne).toHaveBeenCalledWith({ token });
		expect(User.updateOne).toHaveBeenCalledWith(
			{ _id: userId },
			{
				$push: {
					planners: {
						planner: plannerId,
						accessLevel: 'write',
					},
				},
			},
		);
		expect(mockDeleteOne).toHaveBeenCalled();
	});

	it('should return error when user is not authenticated', async () => {
		vi.mocked(getUser).mockResolvedValue(null);

		const result = await acceptInvite({ token });

		expect(result).toEqual({
			ok: false,
			error: 'Unauthorized',
		});
		expect(PendingInvite.findOne).not.toHaveBeenCalled();
	});

	it('should return error when invite token is invalid', async () => {
		vi.mocked(getUser).mockResolvedValue({
			_id: userId as never,
			email: userEmail,
			name: 'Test User',
			planners: [],
		} as never);

		// Mock no invite found
		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);

		const result = await acceptInvite({ token });

		expect(result).toEqual({
			ok: false,
			error: 'Invite not found',
		});
	});

	it('should return error when invite has expired', async () => {
		vi.mocked(getUser).mockResolvedValue({
			_id: userId as never,
			email: userEmail,
			name: 'Test User',
			planners: [],
		} as never);

		const mockDeleteOne = vi.fn().mockResolvedValue({ deletedCount: 1 });
		// Mock expired invite
		vi.mocked(PendingInvite.findOne).mockResolvedValue({
			_id: 'invite-id' as never,
			email: userEmail,
			planner: { toString: () => plannerId },
			accessLevel: 'read',
			token,
			expiresAt: new Date('2024-01-10T00:00:00.000Z'), // Past date
			deleteOne: mockDeleteOne,
		} as never);

		const result = await acceptInvite({ token });

		expect(result).toEqual({
			ok: false,
			error: 'Invite has expired',
		});
		expect(mockDeleteOne).toHaveBeenCalled();
		expect(User.updateOne).not.toHaveBeenCalled();
	});

	it('should return error when invite email does not match user email', async () => {
		vi.mocked(getUser).mockResolvedValue({
			_id: userId as never,
			email: userEmail,
			name: 'Test User',
			planners: [],
		} as never);

		// Mock invite with different email
		vi.mocked(PendingInvite.findOne).mockResolvedValue({
			_id: 'invite-id' as never,
			email: 'different@example.com',
			planner: { toString: () => plannerId },
			accessLevel: 'read',
			token,
			expiresAt: new Date('2024-01-20T00:00:00.000Z'),
		} as never);

		const result = await acceptInvite({ token });

		expect(result).toEqual({
			ok: false,
			error: 'This invite is for a different email address',
		});
		expect(User.updateOne).not.toHaveBeenCalled();
	});

	it('should succeed idempotently when user is already a member', async () => {
		vi.mocked(getUser).mockResolvedValue({
			_id: userId as never,
			email: userEmail,
			name: 'Test User',
			planners: [
				{
					planner: { toString: () => plannerId },
					accessLevel: 'read' as AccessLevel,
				},
			],
		} as never);

		const mockDeleteOne = vi.fn().mockResolvedValue({ deletedCount: 1 });
		// Mock valid invite
		vi.mocked(PendingInvite.findOne).mockResolvedValue({
			_id: 'invite-id' as never,
			email: userEmail,
			planner: { toString: () => plannerId },
			accessLevel: 'read',
			token,
			expiresAt: new Date('2024-01-20T00:00:00.000Z'),
			deleteOne: mockDeleteOne,
		} as never);

		const result = await acceptInvite({ token });

		expect(result).toEqual({
			ok: true,
			data: { plannerId },
		});
		// User already member, so shouldn't update
		expect(User.updateOne).not.toHaveBeenCalled();
		// But invite should still be deleted
		expect(mockDeleteOne).toHaveBeenCalled();
	});

	it('should add user with correct access level from invite', async () => {
		vi.mocked(getUser).mockResolvedValue({
			_id: userId as never,
			email: userEmail,
			name: 'Test User',
			planners: [],
		} as never);

		const mockDeleteOne = vi.fn().mockResolvedValue({ deletedCount: 1 });
		// Mock invite with 'admin' access level
		vi.mocked(PendingInvite.findOne).mockResolvedValue({
			_id: 'invite-id' as never,
			email: userEmail,
			planner: { toString: () => plannerId },
			accessLevel: 'admin',
			token,
			expiresAt: new Date('2024-01-20T00:00:00.000Z'),
			deleteOne: mockDeleteOne,
		} as never);

		vi.mocked(User.updateOne).mockResolvedValue({
			acknowledged: true,
			matchedCount: 1,
			modifiedCount: 1,
		} as never);

		await acceptInvite({ token });

		expect(User.updateOne).toHaveBeenCalledWith(
			{ _id: userId },
			{
				$push: {
					planners: {
						planner: plannerId,
						accessLevel: 'admin',
					},
				},
			},
		);
	});

	it('should delete invite after successful acceptance', async () => {
		vi.mocked(getUser).mockResolvedValue({
			_id: userId as never,
			email: userEmail,
			name: 'Test User',
			planners: [],
		} as never);

		const mockDeleteOne = vi.fn().mockResolvedValue({ deletedCount: 1 });
		vi.mocked(PendingInvite.findOne).mockResolvedValue({
			_id: 'invite-id' as never,
			email: userEmail,
			planner: { toString: () => plannerId },
			accessLevel: 'read',
			token,
			expiresAt: new Date('2024-01-20T00:00:00.000Z'),
			deleteOne: mockDeleteOne,
		} as never);

		vi.mocked(User.updateOne).mockResolvedValue({
			acknowledged: true,
			matchedCount: 1,
			modifiedCount: 1,
		} as never);

		await acceptInvite({ token });

		expect(mockDeleteOne).toHaveBeenCalled();
	});

	it('should return error when user is not authenticated', async () => {
		vi.mocked(getUser).mockResolvedValue(null);

		const result = await acceptInvite({ token });

		expect(result).toEqual({
			ok: false,
			error: 'Unauthorized',
		});
		expect(PendingInvite.findOne).not.toHaveBeenCalled();
	});

	it('should handle database errors gracefully', async () => {
		vi.mocked(getUser).mockResolvedValue({
			_id: userId as never,
			email: userEmail,
			name: 'Test User',
			planners: [],
		} as never);

		vi.mocked(PendingInvite.findOne).mockRejectedValue(
			new Error('Database connection failed'),
		);

		const result = await acceptInvite({ token });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBe('Database connection failed');
		}
	});

	it('should handle non-Error exceptions gracefully', async () => {
		vi.mocked(getUser).mockResolvedValue({
			_id: userId as never,
			email: userEmail,
			name: 'Test User',
			planners: [],
		} as never);

		vi.mocked(PendingInvite.findOne).mockRejectedValue('String error');

		const result = await acceptInvite({ token });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBe('An error occurred');
		}
	});
});
