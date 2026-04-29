import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mocks must be hoisted before imports
vi.mock('@/_actions/auth/checkAuth', () => ({
	checkAuth: vi.fn(),
}));

vi.mock('@/_models', () => ({
	PendingInvite: {
		find: vi.fn(),
	},
}));

vi.mock('@/_utils/serialize', () => ({
	serialize: vi.fn((data) => data),
}));

import { checkAuth } from '@/_actions/auth/checkAuth';
import { PendingInvite } from '@/_models';
import { serialize } from '@/_utils/serialize';

import { getPendingInvites } from './getPendingInvites';

const mockCheckAuth = vi.mocked(checkAuth);
const mockPendingInviteFind = vi.mocked(PendingInvite.find);
const mockSerialize = vi.mocked(serialize);

const VALID_PLANNER_ID = '507f1f77bcf86cd799439011';

describe('getPendingInvites', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('returns error when user is not authenticated', async () => {
		mockCheckAuth.mockResolvedValue({ type: 'unauthenticated' });

		const result = await getPendingInvites(VALID_PLANNER_ID);

		expect(result).toEqual({
			invites: [],
			error: 'Unauthorized',
		});
		expect(mockCheckAuth).toHaveBeenCalledWith(expect.anything(), 'admin');
		expect(mockPendingInviteFind).not.toHaveBeenCalled();
	});

	it('returns error when caller lacks admin access', async () => {
		mockCheckAuth.mockResolvedValue({ type: 'unauthorized' });

		const result = await getPendingInvites(VALID_PLANNER_ID);

		expect(result).toEqual({
			invites: [],
			error: 'Unauthorized',
		});
		expect(mockCheckAuth).toHaveBeenCalledWith(expect.anything(), 'admin');
		expect(mockPendingInviteFind).not.toHaveBeenCalled();
	});

	it('returns empty array when no pending invites', async () => {
		mockCheckAuth.mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin',
			user: {
				_id: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				planners: [],
			},
		} as never);
		mockPendingInviteFind.mockReturnValue({
			sort: vi.fn().mockResolvedValue([]),
		} as unknown as ReturnType<typeof PendingInvite.find>);

		const result = await getPendingInvites(VALID_PLANNER_ID);

		expect(result).toEqual({
			invites: [],
		});
		expect(mockPendingInviteFind).toHaveBeenCalledWith({
			planner: VALID_PLANNER_ID,
		});
	});

	it('returns sorted invites newest first', async () => {
		mockCheckAuth.mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin',
			user: {
				_id: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				planners: [],
			},
		} as never);

		const mockInvites = [
			{
				_id: { toString: () => 'invite1' },
				email: 'user1@example.com',
				accessLevel: 'write',
				createdAt: new Date('2024-01-01'),
				expiresAt: new Date('2024-02-01'),
				token: 'secret1',
				invitedBy: 'user123',
			},
			{
				_id: { toString: () => 'invite2' },
				email: 'user2@example.com',
				accessLevel: 'read',
				createdAt: new Date('2024-01-15'),
				expiresAt: new Date('2024-02-15'),
				token: 'secret2',
				invitedBy: 'user123',
			},
		];

		const sortMock = vi.fn().mockResolvedValue(mockInvites);
		mockPendingInviteFind.mockReturnValue({
			sort: sortMock,
		} as unknown as ReturnType<typeof PendingInvite.find>);

		const result = await getPendingInvites(VALID_PLANNER_ID);

		expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
		expect(result.invites).toHaveLength(2);
		// Should be sorted newest first
		expect(result.invites[0].id).toBe('invite1');
		expect(result.invites[1].id).toBe('invite2');
	});

	it('returns sanitized invite data with correct fields', async () => {
		mockCheckAuth.mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin',
			user: {
				_id: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				planners: [],
			},
		} as never);

		const mockInvite = {
			_id: { toString: () => 'invite123' },
			email: 'user@example.com',
			accessLevel: 'admin',
			createdAt: new Date('2024-01-01T10:00:00.000Z'),
			expiresAt: new Date('2024-02-01T10:00:00.000Z'),
			token: 'secret-token',
			invitedBy: 'user456',
		};

		mockPendingInviteFind.mockReturnValue({
			sort: vi.fn().mockResolvedValue([mockInvite]),
		} as unknown as ReturnType<typeof PendingInvite.find>);

		const result = await getPendingInvites(VALID_PLANNER_ID);

		expect(result.invites).toHaveLength(1);
		expect(result.invites[0]).toEqual({
			id: 'invite123',
			email: 'user@example.com',
			accessLevel: 'admin',
			invitedAt: '2024-01-01T10:00:00.000Z',
			expiresAt: '2024-02-01T10:00:00.000Z',
		});
		// Ensure sensitive fields are NOT exposed
		expect(result.invites[0]).not.toHaveProperty('token');
		expect(result.invites[0]).not.toHaveProperty('invitedBy');
		expect(mockSerialize).toHaveBeenCalled();
	});

	it('returns error on database failure', async () => {
		mockCheckAuth.mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin',
			user: {
				_id: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				planners: [],
			},
		} as never);
		mockPendingInviteFind.mockReturnValue({
			sort: vi.fn().mockRejectedValue(new Error('Database connection failed')),
		} as unknown as ReturnType<typeof PendingInvite.find>);

		const result = await getPendingInvites(VALID_PLANNER_ID);

		expect(result).toEqual({
			invites: [],
			error: 'Failed to fetch pending invites',
		});
	});

	it('returns error when checkAuth throws', async () => {
		mockCheckAuth.mockRejectedValue(new Error('Unexpected error'));

		const result = await getPendingInvites(VALID_PLANNER_ID);

		expect(result).toEqual({
			invites: [],
			error: 'Failed to fetch pending invites',
		});
	});

	it('returns error when checkAuth returns error type', async () => {
		mockCheckAuth.mockResolvedValue({
			type: 'error',
			error: new Error('Auth service error'),
		});

		const result = await getPendingInvites(VALID_PLANNER_ID);

		expect(result).toEqual({
			invites: [],
			error: 'Unauthorized',
		});
		expect(mockCheckAuth).toHaveBeenCalledWith(expect.anything(), 'admin');
		expect(mockPendingInviteFind).not.toHaveBeenCalled();
	});

	it('returns error for invalid plannerId format', async () => {
		const result = await getPendingInvites('invalid-id');

		expect(result).toEqual({
			invites: [],
			error: 'Unauthorized',
		});
		expect(mockCheckAuth).not.toHaveBeenCalled();
		expect(mockPendingInviteFind).not.toHaveBeenCalled();
	});
});
