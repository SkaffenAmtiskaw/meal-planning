import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';

import { checkAuth } from '@/_actions/auth';
import { sendInviteEmail } from '@/_auth/emails/sendInviteEmail';
import { PendingInvite, Planner, User } from '@/_models';
import type { AccessLevel } from '@/_models/user';

import { inviteUser } from './inviteUser';

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));

vi.mock('@/_auth/emails/sendInviteEmail', () => ({
	sendInviteEmail: vi.fn(),
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

vi.mock('@/_utils/catchify', () => ({
	catchify: vi.fn(async (fn: () => Promise<unknown>) => {
		try {
			return [await fn(), undefined];
		} catch (error) {
			return [
				undefined,
				error instanceof Error ? error : new Error(String(error)),
			];
		}
	}),
}));

vi.mock('@/_utils/serialize', () => ({
	serialize: vi.fn((data: unknown) => data),
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

vi.mock('@/env', async () => await import('@mocks/env'));

describe('inviteUser', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const callerUserId = '507f1f77bcf86cd799439012';
	const inviteEmail = 'invitee@example.com';
	const mockInviteId = '507f1f77bcf86cd799439013';

	const mockCallerUser = {
		_id: callerUserId,
		email: 'caller@example.com',
		name: 'Caller User',
		planners: [],
	};

	const mockCallerUserNoName = {
		_id: callerUserId,
		email: 'caller@example.com',
		planners: [],
	};

	beforeAll(() => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockCallerUser as never,
		});

		vi.mocked(User.findOne).mockResolvedValue(null);
		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);
		vi.mocked(PendingInvite.create).mockResolvedValue({
			_id: mockInviteId as never,
			email: inviteEmail,
			planner: plannerId,
			invitedBy: callerUserId as never,
			accessLevel: 'read',
			token: 'mock-token',
			expiresAt: new Date(),
		} as never);
		vi.mocked(Planner.findById).mockResolvedValue(null);
		vi.mocked(sendInviteEmail).mockResolvedValue(undefined);
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns unauthorized when user is not authenticated', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({
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

	it('returns unauthorized when caller lacks admin access', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({
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

	it('returns unauthorized when auth check returns error type', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({
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

	it('returns unauthorized when auth check throws', async () => {
		vi.mocked(checkAuth).mockRejectedValueOnce(new Error('Auth service error'));

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result).toEqual({
			ok: false,
			error: 'Unauthorized',
		});
	});

	it('returns error for invalid email format', async () => {
		const result = await inviteUser({
			plannerId,
			email: 'invalid-email',
		});

		expect(result).toEqual({
			ok: false,
			error: 'Invalid email format',
		});
		expect(checkAuth).not.toHaveBeenCalled();
	});

	it('returns error when email is already a member', async () => {
		vi.mocked(User.findOne).mockResolvedValueOnce({
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
		vi.mocked(PendingInvite.findOne).mockResolvedValueOnce({
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

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result).toEqual({
			ok: true,
			data: { inviteId: mockInviteId },
		});

		const callArgs = vi.mocked(PendingInvite.create).mock.calls[0][0];
		expect(callArgs.accessLevel).toBe('read');
		expect(callArgs.token).toEqual(expect.any(String));
		expect(callArgs.expiresAt).toEqual(new Date('2024-01-08T00:00:00.000Z'));
	});

	it('uses provided accessLevel when specified', async () => {
		await inviteUser({
			plannerId,
			email: inviteEmail,
			accessLevel: 'write',
		});

		const callArgs = vi.mocked(PendingInvite.create).mock.calls[0][0];
		expect(callArgs.accessLevel).toBe('write');
	});

	it('returns error when user lookup fails', async () => {
		vi.mocked(User.findOne).mockRejectedValueOnce(
			new Error('Database connection failed'),
		);

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result).toEqual({
			ok: false,
			error: 'Database connection failed',
		});
	});

	it('returns error when pending invite lookup fails', async () => {
		vi.mocked(PendingInvite.findOne).mockRejectedValueOnce(
			new Error('Database error'),
		);

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result).toEqual({
			ok: false,
			error: 'Database error',
		});
	});

	it('returns error when planner lookup fails', async () => {
		vi.mocked(Planner.findById).mockRejectedValueOnce(
			new Error('Planner lookup failed'),
		);

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result).toEqual({
			ok: false,
			error: 'Planner lookup failed',
		});
	});

	it('returns error when invite creation fails', async () => {
		vi.mocked(PendingInvite.create).mockRejectedValueOnce(
			new Error('Create failed'),
		);

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result).toEqual({
			ok: false,
			error: 'Create failed',
		});
	});

	it('returns default error when invite creation returns null', async () => {
		vi.mocked(PendingInvite.create).mockResolvedValueOnce(null as never);

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result).toEqual({
			ok: false,
			error: 'Failed to create invite',
		});
	});

	it('returns error when sendInviteEmail throws', async () => {
		vi.mocked(sendInviteEmail).mockRejectedValueOnce(
			new Error('Email service failed'),
		);

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result).toEqual({
			ok: false,
			error: 'Email service failed',
		});
	});

	it('uses default name when caller has no name', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockCallerUserNoName as never,
		});

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
		vi.mocked(Planner.findById).mockResolvedValueOnce({
			_id: plannerId as never,
			name: 'My Custom Meal Planner',
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
		vi.mocked(User.findOne).mockResolvedValueOnce({
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

		const result = await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(result).toEqual({
			ok: true,
			data: { inviteId: mockInviteId },
		});
		expect(sendInviteEmail).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'existing_user',
				acceptUrl: 'https://app.example.com/',
			}),
		);
	});

	it('sends new_user email for new users', async () => {
		await inviteUser({
			plannerId,
			email: inviteEmail,
		});

		expect(sendInviteEmail).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'new_user',
				acceptUrl: expect.stringContaining('/invite?token='),
			}),
		);
	});
});
