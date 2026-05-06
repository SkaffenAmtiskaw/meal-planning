import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mocks must be hoisted before imports
vi.mock('@/_models', () => ({
	PendingInvite: {
		find: vi.fn(),
	},
	Planner: {
		findById: vi.fn(),
	},
	User: {
		findById: vi.fn(),
	},
}));

vi.mock('@/_utils/serialize', () => ({
	serialize: vi.fn((data) => data),
}));

import { PendingInvite, Planner, User } from '@/_models';

import { getUserInvites } from './getUserInvites';

const mockPendingInviteFind = vi.mocked(PendingInvite.find);
const mockPlannerFindById = vi.mocked(Planner.findById);
const mockUserFindById = vi.mocked(User.findById);

describe('getUserInvites', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should return error when email is not provided', async () => {
		const result = await getUserInvites('');

		expect(result).toEqual({
			invites: [],
			error: 'Unauthorized',
		});
		expect(mockPendingInviteFind).not.toHaveBeenCalled();
	});

	it('should return empty array when user has no pending invites', async () => {
		mockPendingInviteFind.mockReturnValue({
			sort: vi.fn().mockResolvedValue([]),
		} as unknown as ReturnType<typeof PendingInvite.find>);

		const result = await getUserInvites('user@example.com');

		expect(result).toEqual({
			invites: [],
		});
		expect(mockPendingInviteFind).toHaveBeenCalledWith({
			email: 'user@example.com',
		});
	});

	it('should return invites for authenticated user', async () => {
		const mockInvite = {
			_id: { toString: () => 'invite123' },
			email: 'user@example.com',
			planner: { toString: () => 'planner123' } as never,
			invitedBy: { toString: () => 'inviter123' } as never,
			accessLevel: 'write',
			createdAt: new Date('2024-01-01T10:00:00.000Z'),
			expiresAt: new Date('2024-02-01T10:00:00.000Z'),
			token: 'secret-token',
		};

		mockPendingInviteFind.mockReturnValue({
			sort: vi.fn().mockResolvedValue([mockInvite]),
		} as unknown as ReturnType<typeof PendingInvite.find>);

		mockPlannerFindById.mockResolvedValue({
			_id: { toString: () => 'planner123' } as never,
			name: 'My Planner',
		} as never);

		mockUserFindById.mockResolvedValue({
			_id: { toString: () => 'inviter123' } as never,
			name: 'John Doe',
		} as never);

		const result = await getUserInvites('user@example.com');

		expect(result.invites).toHaveLength(1);
		expect(result.invites[0]).toEqual({
			id: 'invite123',
			plannerId: 'planner123',
			plannerName: 'My Planner',
			invitedBy: 'John Doe',
			accessLevel: 'write',
			invitedAt: '2024-01-01T10:00:00.000Z',
			expiresAt: '2024-02-01T10:00:00.000Z',
			token: 'secret-token',
		});
	});

	it('should populate planner name and inviter name', async () => {
		const mockInvite = {
			_id: { toString: () => 'invite123' },
			email: 'user@example.com',
			planner: { toString: () => 'planner123' } as never,
			invitedBy: { toString: () => 'inviter123' } as never,
			accessLevel: 'read',
			createdAt: new Date('2024-01-15T10:00:00.000Z'),
			expiresAt: new Date('2024-02-15T10:00:00.000Z'),
			token: 'token123',
		};

		mockPendingInviteFind.mockReturnValue({
			sort: vi.fn().mockResolvedValue([mockInvite]),
		} as unknown as ReturnType<typeof PendingInvite.find>);

		mockPlannerFindById.mockResolvedValue({
			_id: { toString: () => 'planner123' } as never,
			name: 'Family Meal Plan',
		} as never);

		mockUserFindById.mockResolvedValue({
			_id: { toString: () => 'inviter123' } as never,
			name: 'Jane Smith',
		} as never);

		const result = await getUserInvites('user@example.com');

		expect(mockPlannerFindById).toHaveBeenCalledWith('planner123');
		expect(mockUserFindById).toHaveBeenCalledWith('inviter123');
		expect(result.invites[0].plannerName).toBe('Family Meal Plan');
		expect(result.invites[0].invitedBy).toBe('Jane Smith');
	});

	it('should handle missing planner gracefully', async () => {
		const mockInvite = {
			_id: { toString: () => 'invite123' },
			email: 'user@example.com',
			planner: { toString: () => 'deleted-planner' } as never,
			invitedBy: { toString: () => 'inviter123' } as never,
			accessLevel: 'read',
			createdAt: new Date('2024-01-15T10:00:00.000Z'),
			expiresAt: new Date('2024-02-15T10:00:00.000Z'),
			token: 'token123',
		};

		mockPendingInviteFind.mockReturnValue({
			sort: vi.fn().mockResolvedValue([mockInvite]),
		} as unknown as ReturnType<typeof PendingInvite.find>);

		// Planner no longer exists
		mockPlannerFindById.mockResolvedValue(null);

		mockUserFindById.mockResolvedValue({
			_id: { toString: () => 'inviter123' } as never,
			name: 'Jane Smith',
		} as never);

		const result = await getUserInvites('user@example.com');

		expect(result.invites).toHaveLength(1);
		expect(result.invites[0].plannerName).toBe('Unknown Planner');
	});

	it('should handle missing inviter gracefully', async () => {
		const mockInvite = {
			_id: { toString: () => 'invite123' },
			email: 'user@example.com',
			planner: { toString: () => 'planner123' } as never,
			invitedBy: { toString: () => 'deleted-user' } as never,
			accessLevel: 'read',
			createdAt: new Date('2024-01-15T10:00:00.000Z'),
			expiresAt: new Date('2024-02-15T10:00:00.000Z'),
			token: 'token123',
		};

		mockPendingInviteFind.mockReturnValue({
			sort: vi.fn().mockResolvedValue([mockInvite]),
		} as unknown as ReturnType<typeof PendingInvite.find>);

		mockPlannerFindById.mockResolvedValue({
			_id: { toString: () => 'planner123' } as never,
			name: 'My Planner',
		} as never);

		// Inviter no longer exists
		mockUserFindById.mockResolvedValue(null);

		const result = await getUserInvites('user@example.com');

		expect(result.invites).toHaveLength(1);
		expect(result.invites[0].invitedBy).toBe('Unknown User');
	});

	it('should sort invites by createdAt descending', async () => {
		const mockInvites = [
			{
				_id: { toString: () => 'invite1' },
				email: 'user@example.com',
				planner: { toString: () => 'planner1' } as never,
				invitedBy: { toString: () => 'inviter1' } as never,
				accessLevel: 'read',
				createdAt: new Date('2024-01-01T10:00:00.000Z'),
				expiresAt: new Date('2024-02-01T10:00:00.000Z'),
				token: 'token1',
			},
			{
				_id: { toString: () => 'invite2' },
				email: 'user@example.com',
				planner: { toString: () => 'planner2' } as never,
				invitedBy: { toString: () => 'inviter2' } as never,
				accessLevel: 'write',
				createdAt: new Date('2024-01-15T10:00:00.000Z'),
				expiresAt: new Date('2024-02-15T10:00:00.000Z'),
				token: 'token2',
			},
		];

		const sortMock = vi.fn().mockResolvedValue(mockInvites);
		mockPendingInviteFind.mockReturnValue({
			sort: sortMock,
		} as unknown as ReturnType<typeof PendingInvite.find>);

		mockPlannerFindById.mockResolvedValue({
			_id: { toString: () => 'planner1' } as never,
			name: 'Planner 1',
		} as never);

		mockUserFindById.mockResolvedValue({
			_id: { toString: () => 'inviter1' } as never,
			name: 'Inviter 1',
		} as never);

		const result = await getUserInvites('user@example.com');

		expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
		expect(result.invites).toHaveLength(2);
		expect(result.invites[0].id).toBe('invite1');
		expect(result.invites[1].id).toBe('invite2');
	});

	it('should return error on database failure', async () => {
		mockPendingInviteFind.mockReturnValue({
			sort: vi.fn().mockRejectedValue(new Error('Database connection failed')),
		} as unknown as ReturnType<typeof PendingInvite.find>);

		const result = await getUserInvites('user@example.com');

		expect(result).toEqual({
			invites: [],
			error: 'Failed to fetch invites',
		});
	});

	it('should handle multiple invites with mixed missing data', async () => {
		const mockInvites = [
			{
				_id: { toString: () => 'invite1' },
				email: 'user@example.com',
				planner: { toString: () => 'planner1' } as never,
				invitedBy: { toString: () => 'inviter1' } as never,
				accessLevel: 'admin',
				createdAt: new Date('2024-01-01T10:00:00.000Z'),
				expiresAt: new Date('2024-02-01T10:00:00.000Z'),
				token: 'token1',
			},
			{
				_id: { toString: () => 'invite2' },
				email: 'user@example.com',
				planner: { toString: () => 'deleted-planner' } as never,
				invitedBy: { toString: () => 'deleted-inviter' } as never,
				accessLevel: 'read',
				createdAt: new Date('2024-01-10T10:00:00.000Z'),
				expiresAt: new Date('2024-02-10T10:00:00.000Z'),
				token: 'token2',
			},
		];

		mockPendingInviteFind.mockReturnValue({
			sort: vi.fn().mockResolvedValue(mockInvites),
		} as unknown as ReturnType<typeof PendingInvite.find>);

		// First planner exists, second is null
		mockPlannerFindById
			.mockResolvedValueOnce({
				_id: { toString: () => 'planner1' } as never,
				name: 'Valid Planner',
			} as never)
			.mockResolvedValueOnce(null);

		// First inviter exists, second is null
		mockUserFindById
			.mockResolvedValueOnce({
				_id: { toString: () => 'inviter1' } as never,
				name: 'Valid Inviter',
			} as never)
			.mockResolvedValueOnce(null);

		const result = await getUserInvites('user@example.com');

		expect(result.invites).toHaveLength(2);
		expect(result.invites[0].plannerName).toBe('Valid Planner');
		expect(result.invites[0].invitedBy).toBe('Valid Inviter');
		expect(result.invites[1].plannerName).toBe('Unknown Planner');
		expect(result.invites[1].invitedBy).toBe('Unknown User');
	});
});
