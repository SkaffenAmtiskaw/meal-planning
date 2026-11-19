import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { sendInviteEmail } from '@/_email/sendInviteEmail';
import { pendingInvites } from '@/_models/database/pendingInvites';
import { planners } from '@/_models/database/planners';
import { users } from '@/_models/database/users';
import type { AccessLevel } from '@/_models/user';
import { reportError } from '@/_reporting/reportError';

import { inviteUser } from './inviteUser';

vi.mock(
	'@/_actions/auth/checkAuth',
	async () => await import('#mocks/@/_actions/auth/checkAuth'),
);
vi.mock('@/_email/sendInviteEmail', async () => ({
	sendInviteEmail: vi.fn(),
}));
vi.mock('@/env', async () => await import('#mocks/env'));
vi.mock(
	'@/_models/database/newId',
	async () => await import('#mocks/@/_models/database/newId'),
);
vi.mock(
	'@/_models/database/planners',
	async () => await import('#mocks/@/_models/database/planners'),
);
vi.mock(
	'@/_models/database/pendingInvites',
	async () => await import('#mocks/@/_models/database/pendingInvites'),
);
vi.mock(
	'@/_models/database/users',
	async () => await import('#mocks/@/_models/database/users'),
);
vi.mock('@/_utils/catchify', async () => ({
	catchify: vi.fn(async (callback: () => Promise<unknown>) => {
		try {
			return [await callback()];
		} catch (e) {
			return [undefined, e as Error];
		}
	}),
}));
vi.mock(
	'@/_reporting/reportError',
	async () => await import('#mocks/@/_reporting/reportError'),
);
vi.mock('node:crypto', () => ({
	default: {
		randomUUID: () => 'mock-uuid-12345',
	},
	randomUUID: () => 'mock-uuid-12345',
}));

describe('inviteUser', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const callerUserId = '507f1f77bcf86cd799439012';
	const inviteEmail = 'invitee@example.com';
	const mockCallerUserId = callerUserId;

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
		vi.mocked(users.findOne).mockResolvedValue(null as never);
		vi.mocked(pendingInvites.findOne).mockResolvedValue(null as never);
		vi.mocked(planners.findOne).mockResolvedValue(null as never);
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

		it('returns unauthorized when auth check returns error type, which checkAuth has already reported', async () => {
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
			expect(reportError).not.toHaveBeenCalled();
		});

		it('returns unauthorized and reports when auth check throws', async () => {
			const error = new Error('Auth service error');
			vi.mocked(checkAuth).mockRejectedValueOnce(error);

			const result = await inviteUser({
				plannerId,
				email: inviteEmail,
			});

			expect(result).toEqual({
				ok: false,
				error: 'Unauthorized',
			});
			expect(reportError).toHaveBeenCalledWith(error);
		});

		it('returns unauthorized without reporting when plannerId is invalid', async () => {
			const result = await inviteUser({
				plannerId: 'not-an-object-id',
				email: inviteEmail,
			});

			expect(result).toEqual({
				ok: false,
				error: 'Unauthorized',
			});
			expect(reportError).not.toHaveBeenCalled();
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
			vi.mocked(users.findOne).mockResolvedValueOnce({
				_id: 'existing-user-id',
				email: inviteEmail,
				name: 'Existing User',
				planners: [
					{
						planner: plannerId,
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
			expect(reportError).not.toHaveBeenCalled();
		});

		it('creates invite for existing user who is not a member', async () => {
			vi.mocked(users.findOne).mockResolvedValueOnce({
				_id: 'existing-user-id',
				email: inviteEmail,
				name: 'Existing User',
				planners: [
					{
						planner: 'different-planner-id',
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
				data: { inviteId: 'new-id' },
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
			vi.mocked(pendingInvites.findOne).mockResolvedValueOnce({
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
			expect(reportError).not.toHaveBeenCalled();
		});
	});

	describe('invite creation', () => {
		it('creates pending invite with a new id, secure token and 7-day expiration', async () => {
			const result = await inviteUser({
				plannerId,
				email: inviteEmail,
			});

			expect(result).toEqual({
				ok: true,
				data: { inviteId: 'new-id' },
			});

			expect(pendingInvites.insertOne).toHaveBeenCalledWith(
				expect.objectContaining({
					_id: 'new-id',
					email: inviteEmail,
					planner: plannerId,
					invitedBy: callerUserId,
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

			expect(pendingInvites.insertOne).toHaveBeenCalledWith(
				expect.objectContaining({
					accessLevel: 'write',
				}),
			);
		});

		it('returns error and reports when user lookup fails', async () => {
			const error = new Error('Database connection failed');
			vi.mocked(users.findOne).mockRejectedValueOnce(error);

			const result = await inviteUser({
				plannerId,
				email: inviteEmail,
			});

			expect(result).toEqual({
				ok: false,
				error: 'Database connection failed',
			});
			expect(reportError).toHaveBeenCalledWith(error);
		});

		it('returns error and reports when pending invite lookup fails', async () => {
			const error = new Error('Database error');
			vi.mocked(pendingInvites.findOne).mockRejectedValueOnce(error);

			const result = await inviteUser({
				plannerId,
				email: inviteEmail,
			});

			expect(result).toEqual({
				ok: false,
				error: 'Database error',
			});
			expect(reportError).toHaveBeenCalledWith(error);
		});

		it('returns error and reports when planner lookup fails', async () => {
			const error = new Error('Planner lookup failed');
			vi.mocked(planners.findOne).mockRejectedValueOnce(error);

			const result = await inviteUser({
				plannerId,
				email: inviteEmail,
			});

			expect(result).toEqual({
				ok: false,
				error: 'Planner lookup failed',
			});
			expect(reportError).toHaveBeenCalledWith(error);
		});

		it('returns error and reports when invite creation fails', async () => {
			const error = new Error('Create failed');
			vi.mocked(pendingInvites.insertOne).mockRejectedValueOnce(error);

			const result = await inviteUser({
				plannerId,
				email: inviteEmail,
			});

			expect(result).toEqual({
				ok: false,
				error: 'Create failed',
			});
			expect(reportError).toHaveBeenCalledWith(error);
		});
	});

	describe('email sending', () => {
		it('returns error and reports when sendInviteEmail throws', async () => {
			const error = new Error('Email service failed');
			vi.mocked(sendInviteEmail).mockRejectedValueOnce(error);

			const result = await inviteUser({
				plannerId,
				email: inviteEmail,
			});

			expect(result).toEqual({
				ok: false,
				error: 'Email service failed',
			});
			expect(reportError).toHaveBeenCalledWith(error);
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
			vi.mocked(planners.findOne).mockResolvedValueOnce({
				_id: plannerId,
				name: 'My Custom Meal Planner',
			} as never);

			await inviteUser({
				plannerId,
				email: inviteEmail,
			});

			expect(planners.findOne).toHaveBeenCalledWith({ _id: plannerId });
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
