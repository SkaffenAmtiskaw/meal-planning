import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getUser } from '@/_actions';
import { checkAuth } from '@/_actions/auth/checkAuth';
import { sendInviteEmail } from '@/_auth/emails/sendInviteEmail';
import { PendingInvite, Planner, User } from '@/_models';
import type { AccessLevel } from '@/_models/user';

import { inviteUser } from './inviteUser';

vi.mock('@/_actions/auth/checkAuth', () => ({
	checkAuth: vi.fn(),
}));

vi.mock('@/_actions', () => ({
	getUser: vi.fn(),
}));

vi.mock('@/_models', () => ({
	PendingInvite: {
		findOne: vi.fn(),
		create: vi.fn(),
	},
	User: {
		findOne: vi.fn(),
	},
	Planner: {
		findById: vi.fn(),
	},
}));

vi.mock('@/_utils/serialize', () => ({
	serialize: vi.fn((data) => data),
}));

vi.mock('@/_auth/emails/sendInviteEmail', () => ({
	sendInviteEmail: vi.fn(),
}));

vi.mock('node:crypto', async (importOriginal) => {
	const actual = await importOriginal<typeof import('node:crypto')>();
	return {
		...actual,
		randomUUID: vi.fn(
			() =>
				'mock-uuid-12345' as `${string}-${string}-${string}-${string}-${string}`,
		),
	};
});

describe('inviteUser', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const callerUserId = '507f1f77bcf86cd799439012'; // Valid 24-char hex ObjectId
	const inviteEmail = 'invitee@example.com';
	const mockToken = 'mock-uuid-12345';
	const mockInviteId = '507f1f77bcf86cd799439013'; // Valid 24-char hex ObjectId
	const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

	beforeEach(() => {
		vi.resetAllMocks();
		// Reset Date mock
		vi.useRealTimers();
		// Set environment variable for tests
		process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
	});

	afterEach(() => {
		// Restore original environment variable
		process.env.NEXT_PUBLIC_APP_URL = originalEnv;
	});

	it('returns error when user is not authenticated', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'unauthenticated',
		});

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result).toEqual({
			success: false,
			error: 'Unauthorized',
		});
		expect(checkAuth).toHaveBeenCalledWith(expect.anything(), 'admin');
		expect(User.findOne).not.toHaveBeenCalled();
		expect(PendingInvite.findOne).not.toHaveBeenCalled();
	});

	it('returns error when caller lacks admin access', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'unauthorized',
		});

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result).toEqual({
			success: false,
			error: 'Unauthorized',
		});
		expect(User.findOne).not.toHaveBeenCalled();
		expect(PendingInvite.findOne).not.toHaveBeenCalled();
	});

	it('returns error when email is already a member', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
		});

		// Mock caller user
		vi.mocked(getUser).mockResolvedValue({
			_id: callerUserId as never,
			email: 'caller@example.com',
			name: 'Caller User',
			planners: [],
		} as never);

		// Mock existing user who is already a member
		vi.mocked(User.findOne).mockResolvedValue({
			_id: 'existing-user-id' as never,
			email: inviteEmail,
			name: 'Existing User',
			planners: [
				{
					planner: { toString: () => plannerId },
					accessLevel: 'read',
				},
			],
		} as never);

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result).toEqual({
			success: false,
			error: 'User is already a member',
		});
		expect(PendingInvite.findOne).not.toHaveBeenCalled();
		expect(PendingInvite.create).not.toHaveBeenCalled();
	});

	it('returns error when pending invite already exists', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
		});

		// Mock caller user
		vi.mocked(getUser).mockResolvedValue({
			_id: callerUserId as never,
			email: 'caller@example.com',
			name: 'Caller User',
			planners: [],
		} as never);

		// Mock user not found (not a member yet)
		vi.mocked(User.findOne).mockResolvedValue(null);

		// Mock existing pending invite
		vi.mocked(PendingInvite.findOne).mockResolvedValue({
			_id: 'existing-invite-id' as never,
			email: inviteEmail,
			planner: plannerId,
		} as never);

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result).toEqual({
			success: false,
			error: 'Pending invite already exists',
		});
		expect(PendingInvite.create).not.toHaveBeenCalled();
	});

	it('creates pending invite with secure token and 7-day expiration', async () => {
		const mockDate = new Date('2024-01-01T00:00:00.000Z');
		vi.useFakeTimers();
		vi.setSystemTime(mockDate);

		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
		});

		// Mock caller user
		vi.mocked(getUser).mockResolvedValue({
			_id: callerUserId as never,
			email: 'caller@example.com',
			name: 'Caller User',
			planners: [],
		} as never);

		// Mock no existing user
		vi.mocked(User.findOne).mockResolvedValue(null);

		// Mock no existing pending invite
		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);

		// Mock successful creation
		vi.mocked(PendingInvite.create).mockResolvedValue({
			_id: mockInviteId as never,
			email: inviteEmail,
			planner: plannerId,
			invitedBy: callerUserId as never,
			accessLevel: 'read',
			token: mockToken,
			expiresAt: new Date(),
		} as never);

		await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		const callArgs = vi.mocked(PendingInvite.create).mock.calls[0][0];
		expect(callArgs.accessLevel).toBe('read');
	});

	it('uses provided accessLevel when specified', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
		});

		// Mock caller user
		vi.mocked(getUser).mockResolvedValue({
			_id: callerUserId as never,
			email: 'caller@example.com',
			name: 'Caller User',
			planners: [],
		} as never);

		// Mock no existing user
		vi.mocked(User.findOne).mockResolvedValue(null);

		// Mock no existing pending invite
		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);

		// Mock successful creation
		vi.mocked(PendingInvite.create).mockResolvedValue({
			_id: mockInviteId as never,
			email: inviteEmail,
			planner: plannerId,
			invitedBy: callerUserId as never,
			accessLevel: 'write',
			token: mockToken,
			expiresAt: new Date(),
		} as never);

		await inviteUser({
			plannerId,
			email: inviteEmail,
			accessLevel: 'write',
		});

		const callArgs = vi.mocked(PendingInvite.create).mock.calls[0][0];
		expect(callArgs.accessLevel).toBe('write');
	});

	it('returns error on database failure', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
		});

		// Mock caller user
		vi.mocked(getUser).mockResolvedValue({
			_id: callerUserId as never,
			email: 'caller@example.com',
			name: 'Caller User',
			planners: [],
		} as never);

		// Mock database error
		vi.mocked(User.findOne).mockRejectedValue(
			new Error('Database connection failed'),
		);

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result.success).toBe(false);
		expect(result.error).toContain('Database connection failed');
	});

	it('returns error for invalid email format', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
		});

		const result = await inviteUser({
			plannerId,
			email: 'invalid-email',
		});

		expect(result.success).toBe(false);
		expect(result.error).toContain('Invalid email format');
	});

	it('returns error when checkAuth returns error type', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'error',
			error: new Error('Auth check failed'),
		});

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result).toEqual({
			success: false,
			error: 'Unauthorized',
		});
		expect(User.findOne).not.toHaveBeenCalled();
	});

	it('returns error when getUser returns null', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
		});

		// Mock getUser returning null
		vi.mocked(getUser).mockResolvedValue(null);

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result).toEqual({
			success: false,
			error: 'Unauthorized',
		});
		expect(User.findOne).not.toHaveBeenCalled();
	});

	it('uses default name when caller has no name', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
		});

		// Mock caller user without a name
		vi.mocked(getUser).mockResolvedValue({
			_id: callerUserId as never,
			email: 'caller@example.com',
			// name is undefined
			planners: [],
		} as never);

		// Mock no existing user
		vi.mocked(User.findOne).mockResolvedValue(null);

		// Mock no existing pending invite
		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);

		// Mock successful creation
		vi.mocked(PendingInvite.create).mockResolvedValue({
			_id: mockInviteId as never,
			email: inviteEmail,
			planner: plannerId,
			invitedBy: callerUserId as never,
			accessLevel: 'read',
			token: 'some-token',
			expiresAt: new Date(),
		} as never);

		await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(sendInviteEmail).toHaveBeenCalledWith(
			expect.objectContaining({
				inviterName: 'Someone',
			}),
		);
	});

	it('uses planner name from database in email', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
		});

		// Mock caller user
		vi.mocked(getUser).mockResolvedValue({
			_id: callerUserId as never,
			email: 'caller@example.com',
			name: 'Caller User',
			planners: [],
		} as never);

		// Mock planner with name
		vi.mocked(Planner.findById).mockResolvedValue({
			_id: plannerId as never,
			name: 'My Custom Meal Planner',
		} as never);

		// Mock no existing user
		vi.mocked(User.findOne).mockResolvedValue(null);

		// Mock no existing pending invite
		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);

		// Mock successful creation
		vi.mocked(PendingInvite.create).mockResolvedValue({
			_id: mockInviteId as never,
			email: inviteEmail,
			planner: plannerId,
			invitedBy: callerUserId as never,
			accessLevel: 'read',
			token: 'some-token',
			expiresAt: new Date(),
		} as never);

		await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(sendInviteEmail).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerName: 'My Custom Meal Planner',
			}),
		);
	});

	it('uses default "Meal Planner" when planner is not found', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
		});

		// Mock caller user
		vi.mocked(getUser).mockResolvedValue({
			_id: callerUserId as never,
			email: 'caller@example.com',
			name: 'Caller User',
			planners: [],
		} as never);

		// Mock planner not found (returns null)
		vi.mocked(Planner.findById).mockResolvedValue(null);

		// Mock no existing user
		vi.mocked(User.findOne).mockResolvedValue(null);

		// Mock no existing pending invite
		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);

		// Mock successful creation
		vi.mocked(PendingInvite.create).mockResolvedValue({
			_id: mockInviteId as never,
			email: inviteEmail,
			planner: plannerId,
			invitedBy: callerUserId as never,
			accessLevel: 'read',
			token: 'some-token',
			expiresAt: new Date(),
		} as never);

		await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(sendInviteEmail).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerName: 'Meal Planner',
			}),
		);
	});

	it('creates invite for existing user who is not a member and sends existing_user email', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
		});

		// Mock caller user
		vi.mocked(getUser).mockResolvedValue({
			_id: callerUserId as never,
			email: 'caller@example.com',
			name: 'Caller User',
			planners: [],
		} as never);

		// Mock existing user who is NOT a member of this planner (different planner)
		vi.mocked(User.findOne).mockResolvedValue({
			_id: 'existing-user-id' as never,
			email: inviteEmail,
			name: 'Existing User',
			planners: [
				{
					planner: { toString: () => 'different-planner-id' },
					accessLevel: 'read',
				},
			],
		} as never);

		// Mock no existing pending invite
		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);

		// Mock successful creation
		vi.mocked(PendingInvite.create).mockResolvedValue({
			_id: mockInviteId as never,
			email: inviteEmail,
			planner: plannerId,
			invitedBy: callerUserId as never,
			accessLevel: 'read',
			token: 'some-token',
			expiresAt: new Date(),
		} as never);

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result.success).toBe(true);
		expect(User.findOne).toHaveBeenCalledWith({ email: inviteEmail });
		expect(PendingInvite.findOne).toHaveBeenCalled();
		expect(PendingInvite.create).toHaveBeenCalled();
		// Verify email type is 'existing_user' when user exists
		expect(sendInviteEmail).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'existing_user',
			}),
		);
	});

	it('returns error when sendInviteEmail throws', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
		});

		// Mock caller user
		vi.mocked(getUser).mockResolvedValue({
			_id: callerUserId as never,
			email: 'caller@example.com',
			name: 'Caller User',
			planners: [],
		} as never);

		// Mock no existing user
		vi.mocked(User.findOne).mockResolvedValue(null);

		// Mock no existing pending invite
		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);

		// Mock successful creation
		vi.mocked(PendingInvite.create).mockResolvedValue({
			_id: mockInviteId as never,
			email: inviteEmail,
			planner: plannerId,
			invitedBy: callerUserId as never,
			accessLevel: 'read',
			token: 'some-token',
			expiresAt: new Date(),
		} as never);

		// Mock sendInviteEmail throwing an error
		vi.mocked(sendInviteEmail).mockRejectedValue(
			new Error('Email service failed'),
		);

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result.success).toBe(false);
		expect(result.error).toBe('Email service failed');
	});

	it('returns generic error when non-Error is thrown', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
		});

		// Mock caller user
		vi.mocked(getUser).mockResolvedValue({
			_id: callerUserId as never,
			email: 'caller@example.com',
			name: 'Caller User',
			planners: [],
		} as never);

		// Mock no existing user
		vi.mocked(User.findOne).mockResolvedValue(null);

		// Mock no existing pending invite
		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);

		// Mock successful creation
		vi.mocked(PendingInvite.create).mockResolvedValue({
			_id: mockInviteId as never,
			email: inviteEmail,
			planner: plannerId,
			invitedBy: callerUserId as never,
			accessLevel: 'read',
			token: 'some-token',
			expiresAt: new Date(),
		} as never);

		// Mock sendInviteEmail throwing a non-Error
		vi.mocked(sendInviteEmail).mockRejectedValue('String error');

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result.success).toBe(false);
		expect(result.error).toBe('An error occurred');
	});
});
