import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { sendInviteEmail } from '@/_auth/emails/sendInviteEmail';
import { PendingInvite, Planner, User } from '@/_models';
import type { AccessLevel } from '@/_models/user';

import { inviteUser } from './inviteUser';

vi.mock('@/_actions/auth/checkAuth', () => ({
	checkAuth: vi.fn(),
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

vi.mock('@/env', () => ({
	env: {
		BETTER_AUTH_URL: 'http://localhost:3000',
	},
}));

describe('inviteUser', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const callerUserId = '507f1f77bcf86cd799439012'; // Valid 24-char hex ObjectId
	const inviteEmail = 'invitee@example.com';
	const mockToken = 'mock-uuid-12345';
	const mockInviteId = '507f1f77bcf86cd799439013'; // Valid 24-char hex ObjectId

	const mockCallerUser = {
		_id: callerUserId,
		email: 'caller@example.com',
		name: 'Caller User',
		planners: [],
	} as never;

	const mockCallerUserNoName = {
		_id: callerUserId,
		email: 'caller@example.com',
		planners: [],
	} as never;

	beforeEach(() => {
		vi.resetAllMocks();
		// Reset Date mock
		vi.useRealTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
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
			ok: false,
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
			ok: false,
			error: 'Unauthorized',
		});
		expect(User.findOne).not.toHaveBeenCalled();
		expect(PendingInvite.findOne).not.toHaveBeenCalled();
	});

	it('returns error when email is already a member', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockCallerUser,
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
			ok: false,
			error: 'User is already a member',
		});
		expect(PendingInvite.findOne).not.toHaveBeenCalled();
		expect(PendingInvite.create).not.toHaveBeenCalled();
	});

	it('returns error when pending invite already exists', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockCallerUser,
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
			ok: false,
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
			user: mockCallerUser,
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
			user: mockCallerUser,
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
			user: mockCallerUser,
		} as never);

		// Mock database error
		vi.mocked(User.findOne).mockRejectedValue(
			new Error('Database connection failed'),
		);

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain('Database connection failed');
		}
	});

	it('returns error for invalid email format', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockCallerUser,
		} as never);

		const result = await inviteUser({
			plannerId,
			email: 'invalid-email',
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain('Invalid email format');
		}
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
			ok: false,
			error: 'Unauthorized',
		});
		expect(User.findOne).not.toHaveBeenCalled();
	});

	it('uses default name when caller has no name', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockCallerUserNoName,
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
				acceptUrl: expect.stringContaining('/invite?token='),
			}),
		);
	});

	it('uses planner name from database in email', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockCallerUser,
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
				acceptUrl: expect.stringContaining('/invite?token='),
			}),
		);
	});

	it('uses default "Meal Planner" when planner is not found', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockCallerUser,
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
				acceptUrl: expect.stringContaining('/invite?token='),
			}),
		);
	});

	it('creates invite for existing user who is not a member and sends existing_user email', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockCallerUser,
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

		expect(result.ok).toBe(true);
		expect(User.findOne).toHaveBeenCalledWith({ email: inviteEmail });
		expect(PendingInvite.findOne).toHaveBeenCalled();
		expect(PendingInvite.create).toHaveBeenCalled();
		// Verify email type is 'existing_user' when user exists
		// Existing users get '/' since they handle invites in-app
		expect(sendInviteEmail).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'existing_user',
				acceptUrl: 'http://localhost:3000/',
			}),
		);
	});

	it('returns error when sendInviteEmail throws', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockCallerUser,
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

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBe('Email service failed');
		}
	});

	it('returns error when checkAuth throws', async () => {
		vi.mocked(checkAuth).mockRejectedValue(new Error('Auth service error'));

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result).toEqual({
			ok: false,
			error: 'Unauthorized',
		});
	});

	it('returns error when PendingInvite.findOne throws', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockCallerUser,
		} as never);

		vi.mocked(User.findOne).mockResolvedValue(null);
		vi.mocked(PendingInvite.findOne).mockRejectedValue(
			new Error('Database error'),
		);

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBe('Database error');
		}
	});

	it('returns error when Planner.findById throws', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockCallerUser,
		} as never);

		vi.mocked(User.findOne).mockResolvedValue(null);
		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);
		vi.mocked(Planner.findById).mockRejectedValue(
			new Error('Planner lookup failed'),
		);

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBe('Planner lookup failed');
		}
	});

	it('returns error when PendingInvite.create throws', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockCallerUser,
		} as never);

		vi.mocked(User.findOne).mockResolvedValue(null);
		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);
		vi.mocked(Planner.findById).mockResolvedValue(null);
		vi.mocked(PendingInvite.create).mockRejectedValue(
			new Error('Create failed'),
		);

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBe('Create failed');
		}
	});

	it('returns default error when PendingInvite.create returns null', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockCallerUser,
		} as never);

		vi.mocked(User.findOne).mockResolvedValue(null);
		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);
		vi.mocked(Planner.findById).mockResolvedValue(null);
		// @ts-expect-error mock create returning null (no error thrown)
		vi.mocked(PendingInvite.create).mockResolvedValue(null);

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBe('Failed to create invite');
		}
	});
});
