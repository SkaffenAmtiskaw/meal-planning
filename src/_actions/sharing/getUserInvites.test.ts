import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mocks must be hoisted before imports
vi.mock(
	'@/_models/database/users',
	async () => await import('#mocks/@/_models/database/users'),
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
	'@/_utils/serialize',
	async () => await import('#mocks/@/_utils/serialize'),
);
vi.mock(
	'@/_utils/reportError',
	async () => await import('#mocks/@/_utils/reportError'),
);

import { pendingInvites } from '@/_models/database/pendingInvites';
import { planners } from '@/_models/database/planners';
import { users } from '@/_models/database/users';
import { reportError } from '@/_utils/reportError';

import { getUserInvites } from './getUserInvites';

const mockPendingInviteFind = vi.mocked(pendingInvites.find);
const mockPlannerFindOne = vi.mocked(planners.findOne);
const mockUserFindOne = vi.mocked(users.findOne);

// The find's cursor, sorted, resolves its documents through `toArray`
const findReturning = (toArray: () => Promise<unknown>) => {
	const sort = vi.fn(() => ({ toArray }));
	mockPendingInviteFind.mockReturnValue({ sort } as never);
	return sort;
};

const invite = (overrides: Record<string, unknown> = {}) => ({
	_id: 'invite123',
	email: 'user@example.com',
	planner: 'planner123',
	invitedBy: 'inviter123',
	accessLevel: 'read',
	createdAt: new Date('2024-01-15T10:00:00.000Z'),
	expiresAt: new Date('2024-02-15T10:00:00.000Z'),
	token: 'token123',
	...overrides,
});

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
		expect(reportError).not.toHaveBeenCalled();
	});

	it('should return empty array when user has no pending invites', async () => {
		findReturning(async () => []);

		const result = await getUserInvites('user@example.com');

		expect(result).toEqual({
			invites: [],
		});
		expect(mockPendingInviteFind).toHaveBeenCalledWith({
			email: 'user@example.com',
		});
	});

	it('should return invites for authenticated user', async () => {
		findReturning(async () => [
			invite({
				accessLevel: 'write',
				createdAt: new Date('2024-01-01T10:00:00.000Z'),
				expiresAt: new Date('2024-02-01T10:00:00.000Z'),
				token: 'secret-token',
			}),
		]);
		mockPlannerFindOne.mockResolvedValue({
			_id: 'planner123',
			name: 'My Planner',
		} as never);
		mockUserFindOne.mockResolvedValue({
			_id: 'inviter123',
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
		findReturning(async () => [invite()]);
		mockPlannerFindOne.mockResolvedValue({
			_id: 'planner123',
			name: 'Family Meal Plan',
		} as never);
		mockUserFindOne.mockResolvedValue({
			_id: 'inviter123',
			name: 'Jane Smith',
		} as never);

		const result = await getUserInvites('user@example.com');

		expect(mockPlannerFindOne).toHaveBeenCalledWith({ _id: 'planner123' });
		expect(mockUserFindOne).toHaveBeenCalledWith({ _id: 'inviter123' });
		expect(result.invites[0].plannerName).toBe('Family Meal Plan');
		expect(result.invites[0].invitedBy).toBe('Jane Smith');
	});

	it('should handle missing planner gracefully', async () => {
		findReturning(async () => [invite({ planner: 'deleted-planner' })]);
		// Planner no longer exists
		mockPlannerFindOne.mockResolvedValue(null as never);
		mockUserFindOne.mockResolvedValue({
			_id: 'inviter123',
			name: 'Jane Smith',
		} as never);

		const result = await getUserInvites('user@example.com');

		expect(result.invites).toHaveLength(1);
		expect(result.invites[0].plannerName).toBe('Unknown Planner');
	});

	it('should handle missing inviter gracefully', async () => {
		findReturning(async () => [invite({ invitedBy: 'deleted-user' })]);
		mockPlannerFindOne.mockResolvedValue({
			_id: 'planner123',
			name: 'My Planner',
		} as never);
		// Inviter no longer exists
		mockUserFindOne.mockResolvedValue(null as never);

		const result = await getUserInvites('user@example.com');

		expect(result.invites).toHaveLength(1);
		expect(result.invites[0].invitedBy).toBe('Unknown User');
	});

	it('should sort invites by createdAt descending', async () => {
		const sortMock = findReturning(async () => [
			invite({ _id: 'invite1', planner: 'planner1', invitedBy: 'inviter1' }),
			invite({ _id: 'invite2', planner: 'planner2', invitedBy: 'inviter2' }),
		]);
		mockPlannerFindOne.mockResolvedValue({
			_id: 'planner1',
			name: 'Planner 1',
		} as never);
		mockUserFindOne.mockResolvedValue({
			_id: 'inviter1',
			name: 'Inviter 1',
		} as never);

		const result = await getUserInvites('user@example.com');

		expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
		expect(result.invites).toHaveLength(2);
		expect(result.invites[0].id).toBe('invite1');
		expect(result.invites[1].id).toBe('invite2');
	});

	it('should return error on database failure', async () => {
		const error = new Error('Database connection failed');
		findReturning(async () => {
			throw error;
		});

		const result = await getUserInvites('user@example.com');

		expect(result).toEqual({
			invites: [],
			error: 'Failed to fetch invites',
		});
		expect(reportError).toHaveBeenCalledWith(error);
	});

	it('should handle multiple invites with mixed missing data', async () => {
		findReturning(async () => [
			invite({ _id: 'invite1', planner: 'planner1', invitedBy: 'inviter1' }),
			invite({
				_id: 'invite2',
				planner: 'deleted-planner',
				invitedBy: 'deleted-inviter',
			}),
		]);

		// First planner exists, second is null
		mockPlannerFindOne
			.mockResolvedValueOnce({
				_id: 'planner1',
				name: 'Valid Planner',
			} as never)
			.mockResolvedValueOnce(null as never);

		// First inviter exists, second is null
		mockUserFindOne
			.mockResolvedValueOnce({
				_id: 'inviter1',
				name: 'Valid Inviter',
			} as never)
			.mockResolvedValueOnce(null as never);

		const result = await getUserInvites('user@example.com');

		expect(result.invites).toHaveLength(2);
		expect(result.invites[0].plannerName).toBe('Valid Planner');
		expect(result.invites[0].invitedBy).toBe('Valid Inviter');
		expect(result.invites[1].plannerName).toBe('Unknown Planner');
		expect(result.invites[1].invitedBy).toBe('Unknown User');
	});
});
