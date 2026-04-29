import { beforeEach, describe, expect, it, vi } from 'vitest';

import { addUser } from '@/_actions/user/addUser';
import { auth } from '@/_auth';
import { PendingInvite } from '@/_models';

import { signUpWithInvite } from './signUpWithInvite';
import { validateInviteToken } from './validateInviteToken';

vi.mock('@/_auth', () => ({
	auth: {
		api: {
			createUser: vi.fn(),
			removeUser: vi.fn(),
		},
	},
}));

vi.mock('./validateInviteToken', () => ({
	validateInviteToken: vi.fn(),
}));

vi.mock('@/_actions/user/addUser', () => ({
	addUser: vi.fn(),
}));

vi.mock('@/_models', () => ({
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

	const mockAppUser = {
		_id: 'app-user-id',
		email,
		name: 'Test User',
		planners: [{ planner: plannerId, accessLevel: 'write' }],
	};

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should create user and accept invite for valid token', async () => {
		vi.mocked(validateInviteToken).mockResolvedValue({
			valid: true,
			email,
			plannerName: 'Test Planner',
		});
		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(auth.api.createUser).mockResolvedValue(
			mockBetterAuthUser as never,
		);
		vi.mocked(addUser).mockResolvedValue(mockAppUser as never);
		vi.mocked(PendingInvite.deleteOne).mockResolvedValue({
			deletedCount: 1,
		} as never);

		const result = await signUpWithInvite({ token, password, name });

		expect(result.success).toBe(true);
		expect(validateInviteToken).toHaveBeenCalledWith(token);
		expect(PendingInvite.findOne).toHaveBeenCalledWith({ token });
		expect(auth.api.createUser).toHaveBeenCalledWith({
			body: {
				email,
				password,
				name,
				data: {
					emailVerified: true,
				},
			},
		});
		expect(addUser).toHaveBeenCalledWith({
			email,
			plannerId: expect.any(Object),
			name,
			skipPlannerCreation: true,
			accessLevel: 'write',
			emailVerified: true,
		});
		expect(PendingInvite.deleteOne).toHaveBeenCalledWith({ _id: inviteId });
	});

	it('should return error for invalid token', async () => {
		vi.mocked(validateInviteToken).mockResolvedValue({
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

	it('should return error for expired token', async () => {
		vi.mocked(validateInviteToken).mockResolvedValue({
			valid: false,
			reason: 'expired',
		});

		const result = await signUpWithInvite({ token, password, name });

		expect(result).toEqual({
			success: false,
			error: 'Invalid or expired invite',
		});
		expect(PendingInvite.findOne).not.toHaveBeenCalled();
		expect(auth.api.createUser).not.toHaveBeenCalled();
	});

	it('should create Better Auth user with emailVerified=true in data object', async () => {
		vi.mocked(validateInviteToken).mockResolvedValue({
			valid: true,
			email,
			plannerName: 'Test Planner',
		});
		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(auth.api.createUser).mockResolvedValue(
			mockBetterAuthUser as never,
		);
		vi.mocked(addUser).mockResolvedValue(mockAppUser as never);
		vi.mocked(PendingInvite.deleteOne).mockResolvedValue({
			deletedCount: 1,
		} as never);

		await signUpWithInvite({ token, password, name });

		expect(auth.api.createUser).toHaveBeenCalledWith({
			body: expect.objectContaining({
				data: {
					emailVerified: true,
				},
			}),
		});
	});

	it('should call addUser with skipPlannerCreation=true', async () => {
		vi.mocked(validateInviteToken).mockResolvedValue({
			valid: true,
			email,
			plannerName: 'Test Planner',
		});
		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(auth.api.createUser).mockResolvedValue(
			mockBetterAuthUser as never,
		);
		vi.mocked(addUser).mockResolvedValue(mockAppUser as never);
		vi.mocked(PendingInvite.deleteOne).mockResolvedValue({
			deletedCount: 1,
		} as never);

		await signUpWithInvite({ token, password, name });

		expect(addUser).toHaveBeenCalledWith(
			expect.objectContaining({
				skipPlannerCreation: true,
			}),
		);
	});

	it('should use invite accessLevel when adding user to planner', async () => {
		const adminInvite = {
			...mockInvite,
			accessLevel: 'admin',
		};

		vi.mocked(validateInviteToken).mockResolvedValue({
			valid: true,
			email,
			plannerName: 'Test Planner',
		});
		vi.mocked(PendingInvite.findOne).mockResolvedValue(adminInvite as never);
		vi.mocked(auth.api.createUser).mockResolvedValue(
			mockBetterAuthUser as never,
		);
		vi.mocked(addUser).mockResolvedValue(mockAppUser as never);
		vi.mocked(PendingInvite.deleteOne).mockResolvedValue({
			deletedCount: 1,
		} as never);

		await signUpWithInvite({ token, password, name });

		expect(addUser).toHaveBeenCalledWith(
			expect.objectContaining({
				accessLevel: 'admin',
			}),
		);
	});

	it('should delete invite after successful acceptance', async () => {
		vi.mocked(validateInviteToken).mockResolvedValue({
			valid: true,
			email,
			plannerName: 'Test Planner',
		});
		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(auth.api.createUser).mockResolvedValue(
			mockBetterAuthUser as never,
		);
		vi.mocked(addUser).mockResolvedValue(mockAppUser as never);
		vi.mocked(PendingInvite.deleteOne).mockResolvedValue({
			deletedCount: 1,
		} as never);

		await signUpWithInvite({ token, password, name });

		expect(PendingInvite.deleteOne).toHaveBeenCalledWith({ _id: inviteId });
	});

	it('should return redirect URL with invite_success param', async () => {
		vi.mocked(validateInviteToken).mockResolvedValue({
			valid: true,
			email,
			plannerName: 'Test Planner',
		});
		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(auth.api.createUser).mockResolvedValue(
			mockBetterAuthUser as never,
		);
		vi.mocked(addUser).mockResolvedValue(mockAppUser as never);
		vi.mocked(PendingInvite.deleteOne).mockResolvedValue({
			deletedCount: 1,
		} as never);

		const result = await signUpWithInvite({ token, password, name });

		expect(result.success).toBe(true);
		expect(result.redirectUrl).toBe(
			`/?invite_success=true&planner=${plannerId}`,
		);
	});

	it('should rollback Better Auth user if addUser fails', async () => {
		vi.mocked(validateInviteToken).mockResolvedValue({
			valid: true,
			email,
			plannerName: 'Test Planner',
		});
		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(auth.api.createUser).mockResolvedValue(
			mockBetterAuthUser as never,
		);
		vi.mocked(addUser).mockRejectedValue(new Error('Database error'));
		vi.mocked(auth.api.removeUser).mockResolvedValue({
			success: true,
		} as never);

		const result = await signUpWithInvite({ token, password, name });

		expect(result.success).toBe(false);
		expect(result.error).toBe('Database error');
		expect(auth.api.removeUser).toHaveBeenCalledWith({
			body: { userId: mockBetterAuthUser.user.id },
		});
		expect(PendingInvite.deleteOne).not.toHaveBeenCalled();
	});

	it('should not attempt rollback if Better Auth user creation fails', async () => {
		vi.mocked(validateInviteToken).mockResolvedValue({
			valid: true,
			email,
			plannerName: 'Test Planner',
		});
		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(auth.api.createUser).mockRejectedValue(
			new Error('Better Auth creation failed'),
		);

		const result = await signUpWithInvite({ token, password, name });

		expect(result.success).toBe(false);
		expect(result.error).toBe('Better Auth creation failed');
		expect(auth.api.removeUser).not.toHaveBeenCalled();
		expect(PendingInvite.deleteOne).not.toHaveBeenCalled();
	});

	it('should trim name before using', async () => {
		vi.mocked(validateInviteToken).mockResolvedValue({
			valid: true,
			email,
			plannerName: 'Test Planner',
		});
		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(auth.api.createUser).mockResolvedValue(
			mockBetterAuthUser as never,
		);
		vi.mocked(addUser).mockResolvedValue(mockAppUser as never);
		vi.mocked(PendingInvite.deleteOne).mockResolvedValue({
			deletedCount: 1,
		} as never);

		await signUpWithInvite({ token, password, name: '  Test User  ' });

		expect(auth.api.createUser).toHaveBeenCalledWith({
			body: expect.objectContaining({
				name: 'Test User',
			}),
		});
		expect(addUser).toHaveBeenCalledWith(
			expect.objectContaining({
				name: 'Test User',
			}),
		);
	});

	it('should default name to "New User" if not provided', async () => {
		vi.mocked(validateInviteToken).mockResolvedValue({
			valid: true,
			email,
			plannerName: 'Test Planner',
		});
		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(auth.api.createUser).mockResolvedValue(
			mockBetterAuthUser as never,
		);
		vi.mocked(addUser).mockResolvedValue(mockAppUser as never);
		vi.mocked(PendingInvite.deleteOne).mockResolvedValue({
			deletedCount: 1,
		} as never);

		await signUpWithInvite({ token, password });

		expect(auth.api.createUser).toHaveBeenCalledWith({
			body: expect.objectContaining({
				name: 'New User',
			}),
		});
		expect(addUser).toHaveBeenCalledWith(
			expect.objectContaining({
				name: 'New User',
			}),
		);
	});

	it('should handle database errors gracefully', async () => {
		vi.mocked(validateInviteToken).mockResolvedValue({
			valid: true,
			email,
			plannerName: 'Test Planner',
		});
		vi.mocked(PendingInvite.findOne).mockRejectedValue(
			new Error('Connection failed'),
		);

		const result = await signUpWithInvite({ token, password, name });

		expect(result.success).toBe(false);
		expect(result.error).toBe('Invite not found');
	});

	it('should handle non-Error exception from createUser', async () => {
		vi.mocked(validateInviteToken).mockResolvedValue({
			valid: true,
			email,
			plannerName: 'Test Planner',
		});
		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		// Simulate a non-Error rejection (this shouldn't happen in practice, but we handle it)
		vi.mocked(auth.api.createUser).mockResolvedValue(null as never);

		const result = await signUpWithInvite({ token, password, name });

		expect(result.success).toBe(false);
		expect(result.error).toBe('Failed to create user');
		expect(auth.api.removeUser).not.toHaveBeenCalled();
	});

	it('should handle non-Error exception from addUser rollback', async () => {
		vi.mocked(validateInviteToken).mockResolvedValue({
			valid: true,
			email,
			plannerName: 'Test Planner',
		});
		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(auth.api.createUser).mockResolvedValue(
			mockBetterAuthUser as never,
		);
		// Simulate a non-Error rejection for addUser
		vi.mocked(addUser).mockRejectedValue('String error');

		const result = await signUpWithInvite({ token, password, name });

		expect(result.success).toBe(false);
		expect(result.error).toBe('Failed to add user to planner');
		expect(auth.api.removeUser).toHaveBeenCalledWith({
			body: { userId: mockBetterAuthUser.user.id },
		});
	});

	it('should only accept the specific invite from token', async () => {
		vi.mocked(validateInviteToken).mockResolvedValue({
			valid: true,
			email,
			plannerName: 'Test Planner',
		});
		vi.mocked(PendingInvite.findOne).mockResolvedValue({
			...mockInvite,
			_id: 'specific-invite-id',
		} as never);
		vi.mocked(auth.api.createUser).mockResolvedValue(
			mockBetterAuthUser as never,
		);
		vi.mocked(addUser).mockResolvedValue(mockAppUser as never);
		vi.mocked(PendingInvite.deleteOne).mockResolvedValue({
			deletedCount: 1,
		} as never);

		await signUpWithInvite({ token, password, name });

		// Verify we're looking up by the token passed to the function
		expect(PendingInvite.findOne).toHaveBeenCalledWith({ token });
		// Verify we're deleting the specific invite found
		expect(PendingInvite.deleteOne).toHaveBeenCalledWith({
			_id: 'specific-invite-id',
		});
	});

	it('should handle case when invite not found after validation', async () => {
		vi.mocked(validateInviteToken).mockResolvedValue({
			valid: true,
			email,
			plannerName: 'Test Planner',
		});
		// Token validated but somehow invite is gone (race condition)
		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);

		const result = await signUpWithInvite({ token, password, name });

		expect(result.success).toBe(false);
		expect(result.error).toBe('Invite not found');
		expect(auth.api.createUser).not.toHaveBeenCalled();
	});
});
