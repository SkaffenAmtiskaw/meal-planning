import { Types } from 'mongoose';
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';

import { checkAuth } from '@/_actions/auth';
import { sendInviteEmail } from '@/_auth/emails/sendInviteEmail';
import { Planner } from '@/_models/planner';
import { PendingInvite } from '@/_models/sharing';
import type { AccessLevel } from '@/_models/user';
import { User } from '@/_models/user';

import { inviteUser } from './inviteUser';

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));
vi.mock('@/_auth/emails/sendInviteEmail', () => ({ sendInviteEmail: vi.fn() }));
vi.mock('@/env', async () => await import('@mocks/env'));

vi.mock('@/_models/planner', () => ({
	Planner: { findById: vi.fn() },
}));

vi.mock('@/_models/sharing', () => ({
	PendingInvite: { findOne: vi.fn(), create: vi.fn() },
}));

vi.mock('@/_models/user', () => ({
	User: { findOne: vi.fn() },
}));

vi.mock('node:crypto', () => ({
	default: { randomUUID: vi.fn(() => 'mock-uuid-12345') },
	randomUUID: vi.fn(() => 'mock-uuid-12345'),
}));

vi.mock('@/_utils/serialize', () => ({
	serialize: vi.fn((data) => data),
}));

vi.mock('@/_utils/catchify', () => ({
	catchify: vi.fn(async (fn) => {
		try {
			return [await fn()];
		} catch (error) {
			return [undefined, error];
		}
	}),
}));

describe('inviteUser', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const callerUserId = '507f1f77bcf86cd799439012';
	const inviteEmail = 'invitee@example.com';
	const mockInviteIdStr = '507f1f77bcf86cd799439013';

	const mockCallerUserId = new Types.ObjectId(callerUserId);
	const mockPlannerId = new Types.ObjectId(plannerId);
	const mockInviteId = new Types.ObjectId(mockInviteIdStr);

	const mockInvite = {
		_id: mockInviteId,
		email: inviteEmail,
		planner: mockPlannerId,
		invitedBy: mockCallerUserId,
		accessLevel: 'read' as AccessLevel,
		token: 'mock-token',
		expiresAt: new Date(),
	};

	const setupDefaults = () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized' as const,
			accessLevel: 'admin' as AccessLevel,
			user: {
				_id: mockCallerUserId,
				email: 'caller@example.com',
				name: 'Caller User',
				planners: [],
			} as never,
		});
		vi.mocked(User.findOne).mockResolvedValue(null);
		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);
		vi.mocked(PendingInvite.create).mockResolvedValue(mockInvite as never);
		vi.mocked(Planner.findById).mockResolvedValue(null);
		vi.mocked(sendInviteEmail).mockResolvedValue(undefined);
	};

	beforeAll(() => {
		vi.useFakeTimers();
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	beforeEach(() => {
		vi.resetAllMocks();
		vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
		setupDefaults();
	});

	describe('authentication', () => {
		it('returns unauthorized when user is not authenticated', async () => {
			vi.mocked(checkAuth).mockResolvedValueOnce({
				type: 'unauthenticated' as const,
			});

			const result = await inviteUser({
				plannerId,
				email: inviteEmail,
			});

			expect(result).toEqual({
				ok: false,
				error: 'Unauthorized',
			});
		});

		it('returns unauthorized when caller lacks admin access', async () => {
			vi.mocked(checkAuth).mockResolvedValueOnce({
				type: 'unauthorized' as const,
			});

			const result = await inviteUser({
				plannerId,
				email: inviteEmail,
			});

			expect(result).toEqual({
				ok: false,
				error: 'Unauthorized',
			});
		});

		it('returns unauthorized when auth check returns error type', async () => {
			vi.mocked(checkAuth).mockResolvedValueOnce({
				type: 'error' as const,
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
		});

		it('returns unauthorized when auth check throws', async () => {
			vi.mocked(checkAuth).mockRejectedValueOnce(
				new Error('Auth service error'),
			);

			const result = await inviteUser({
				plannerId,
				email: inviteEmail,
			});

			expect(result).toEqual({
				ok: false,
				error: 'Unauthorized',
			});
		});
	});

	describe('validation', () => {
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
	});

	describe('member checks', () => {
		it('returns error when email is already a member', async () => {
			vi.mocked(User.findOne).mockResolvedValueOnce({
				_id: 'existing-user-id',
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
		});

		it('creates invite for existing user who is not a member', async () => {
			vi.mocked(User.findOne).mockResolvedValueOnce({
				_id: 'existing-user-id',
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
				data: { inviteId: mockInviteIdStr },
			});
			expect(sendInviteEmail).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'existing_user',
					acceptUrl: 'https://app.example.com/',
				}),
			);
		});
	});

	describe('pending invite checks', () => {
		it('returns error when pending invite already exists', async () => {
			vi.mocked(PendingInvite.findOne).mockResolvedValueOnce({
				_id: 'existing-invite-id',
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
		});
	});

	describe('invite creation', () => {
		it('creates pending invite with secure token and 7-day expiration', async () => {
			const result = await inviteUser({
				plannerId,
				email: inviteEmail,
			});

			expect(result).toEqual({
				ok: true,
				data: { inviteId: mockInviteIdStr },
			});

			expect(PendingInvite.create).toHaveBeenCalledWith(
				expect.objectContaining({
					email: inviteEmail,
					planner: expect.any(Types.ObjectId),
					invitedBy: expect.any(Types.ObjectId),
					accessLevel: 'read',
					token: 'mock-uuid-12345',
					expiresAt: new Date('2024-01-08T00:00:00.000Z'),
				}),
			);
		});

		it('uses provided accessLevel when specified', async () => {
			await inviteUser({
				plannerId,
				email: inviteEmail,
				accessLevel: 'write',
			});

			expect(PendingInvite.create).toHaveBeenCalledWith(
				expect.objectContaining({
					accessLevel: 'write',
				}),
			);
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
	});

	describe('email sending', () => {
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
				type: 'authorized' as const,
				accessLevel: 'admin' as AccessLevel,
				user: {
					_id: mockCallerUserId,
					email: 'caller@example.com',
					planners: [],
				} as never,
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
				_id: plannerId,
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

		it('sends new_user email for new users', async () => {
			await inviteUser({
				plannerId,
				email: inviteEmail,
			});

			expect(sendInviteEmail).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'new_user',
					acceptUrl: 'https://app.example.com/invite?token=mock-uuid-12345',
				}),
			);
		});
	});
});
