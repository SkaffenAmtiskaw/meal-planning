import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { addUser } from '@/_actions/user';
import { auth } from '@/_auth';
import { PendingInvite } from '@/_models/sharing';

import { signUpWithInvite } from './signUpWithInvite';
import { validateInviteToken } from './validateInviteToken';

vi.mock('@/_actions/user', async () => await import('@mocks/@/_actions/user'));

vi.mock('@/_auth', () => ({
	auth: {
		api: {
			createUser: vi.fn(),
			removeUser: vi.fn(),
		},
	},
}));

vi.mock(
	'./validateInviteToken',
	async () => await import('@mocks/@/_actions/sharing'),
);

vi.mock('@/_models/sharing', () => ({
	PendingInvite: {
		findOne: vi.fn(),
		deleteOne: vi.fn(),
	},
}));
describe('signUpWithInvite', () => {
	const token = 'valid-token-123';
	const inviteId = 'invite-id-456';
	const plannerId = 'planner-id-789';
	const email = 'newuser@example.com';
	const password = 'securePassword123';
	const name = 'Test User';

	const mockInvite = {
		_id: inviteId,
		email,
		planner: { toString: () => plannerId },
		accessLevel: 'write',
		token,
		expiresAt: new Date(Date.now() + 86400000),
	};

	const mockBetterAuthUser = {
		user: {
			id: 'better-auth-user-id',
			email,
			name: 'Test User',
		},
	};

	beforeAll(() => {
		vi.mocked(validateInviteToken).mockResolvedValue({
			valid: true,
			email,
			plannerName: 'Test Planner',
		});
		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(auth.api.createUser).mockResolvedValue(
			mockBetterAuthUser as never,
		);
		vi.mocked(PendingInvite.deleteOne).mockResolvedValue({
			deletedCount: 1,
		} as never);
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return error when invite token is invalid or expired', async () => {
		vi.mocked(validateInviteToken).mockResolvedValueOnce({
			valid: false,
			reason: 'invalid',
		});

		const result = await signUpWithInvite({ token, password, name });

		expect(result).toEqual({
			success: false,
			error: 'Invalid or expired invite',
		});
		expect(PendingInvite.findOne).not.toHaveBeenCalled();
		expect(auth.api.createUser).not.toHaveBeenCalled();
	});

	it('should return error when invite is not found', async () => {
		vi.mocked(PendingInvite.findOne).mockResolvedValueOnce(null);

		const result = await signUpWithInvite({ token, password, name });

		expect(result).toEqual({
			success: false,
			error: 'Invite not found',
		});
		expect(auth.api.createUser).not.toHaveBeenCalled();
	});

	it('should return error when database lookup fails', async () => {
		vi.mocked(PendingInvite.findOne).mockRejectedValueOnce(
			new Error('Connection failed'),
		);

		const result = await signUpWithInvite({ token, password, name });

		expect(result).toEqual({
			success: false,
			error: 'Invite not found',
		});
		expect(auth.api.createUser).not.toHaveBeenCalled();
	});

	it('should create user, add to planner, delete invite, and return redirect URL for valid token', async () => {
		const result = await signUpWithInvite({
			token,
			password,
			name: '  Test User  ',
		});

		expect(result.success).toBe(true);
		expect(result.redirectUrl).toBe(
			`/?invite_success=true&planner=${plannerId}`,
		);
		expect(validateInviteToken).toHaveBeenCalledWith(token);
		expect(PendingInvite.findOne).toHaveBeenCalledWith({ token });
		expect(auth.api.createUser).toHaveBeenCalledWith({
			body: {
				email,
				password,
				name: 'Test User',
				data: {
					emailVerified: true,
				},
			},
		});
		expect(addUser).toHaveBeenCalledWith({
			email,
			plannerId: expect.any(Object),
			name: 'Test User',
			skipPlannerCreation: true,
			accessLevel: 'write',
			emailVerified: true,
		});
		expect(PendingInvite.deleteOne).toHaveBeenCalledWith({ _id: inviteId });
	});

	it('should default name to "New User" when not provided', async () => {
		const result = await signUpWithInvite({ token, password });

		expect(result.success).toBe(true);
		expect(auth.api.createUser).toHaveBeenCalledWith(
			expect.objectContaining({
				body: expect.objectContaining({
					name: 'New User',
				}),
			}),
		);
		expect(addUser).toHaveBeenCalledWith(
			expect.objectContaining({
				name: 'New User',
			}),
		);
	});

	it('should return error when Better Auth user creation fails', async () => {
		vi.mocked(auth.api.createUser).mockRejectedValueOnce(
			new Error('Better Auth creation failed'),
		);

		const result = await signUpWithInvite({ token, password, name });

		expect(result.success).toBe(false);
		expect(result.error).toBe('Better Auth creation failed');
		expect(auth.api.removeUser).not.toHaveBeenCalled();
		expect(PendingInvite.deleteOne).not.toHaveBeenCalled();
	});

	it('should return error when Better Auth user creation returns empty result', async () => {
		vi.mocked(auth.api.createUser).mockResolvedValueOnce(null as never);

		const result = await signUpWithInvite({ token, password, name });

		expect(result.success).toBe(false);
		expect(result.error).toBe('Failed to create user');
		expect(auth.api.removeUser).not.toHaveBeenCalled();
	});

	it('should rollback Better Auth user when adding user to planner fails', async () => {
		vi.mocked(addUser).mockRejectedValueOnce(new Error('Database error'));

		const result = await signUpWithInvite({ token, password, name });

		expect(result.success).toBe(false);
		expect(result.error).toBe('Database error');
		expect(auth.api.removeUser).toHaveBeenCalledWith({
			body: { userId: mockBetterAuthUser.user.id },
		});
		expect(PendingInvite.deleteOne).not.toHaveBeenCalled();
	});

	it('should rollback with generic message when addUser throws non-Error', async () => {
		vi.mocked(addUser).mockRejectedValueOnce('String error');

		const result = await signUpWithInvite({ token, password, name });

		expect(result.success).toBe(false);
		expect(result.error).toBe('Failed to add user to planner');
		expect(auth.api.removeUser).toHaveBeenCalledWith({
			body: { userId: mockBetterAuthUser.user.id },
		});
	});
});
