import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mocks must be hoisted before imports
vi.mock(
	'@/_actions/auth/checkAuth',
	async () => await import('#mocks/@/_actions/auth/checkAuth'),
);

vi.mock(
	'@/_models/database/pendingInvites',
	async () => await import('#mocks/@/_models/database/pendingInvites'),
);
vi.mock(
	'@/_reporting/reportError',
	async () => await import('#mocks/@/_reporting/reportError'),
);

import { checkAuth } from '@/_actions/auth/checkAuth';
import { pendingInvites } from '@/_models/database/pendingInvites';
import { reportError } from '@/_reporting/reportError';

import { getPendingInvites } from './getPendingInvites';

const mockCheckAuth = vi.mocked(checkAuth);
const mockPendingInviteFind = vi.mocked(pendingInvites.find);

// The find's cursor, sorted, resolves its documents through `toArray`
const findReturning = (toArray: () => Promise<unknown>) => {
	const sort = vi.fn(() => ({ toArray }));
	mockPendingInviteFind.mockReturnValue({ sort } as never);
	return sort;
};

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
		findReturning(async () => []);

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
				_id: 'invite1',
				email: 'user1@example.com',
				accessLevel: 'write',
				createdAt: new Date('2024-01-01'),
				expiresAt: new Date('2024-02-01'),
				token: 'secret1',
				invitedBy: 'user123',
			},
			{
				_id: 'invite2',
				email: 'user2@example.com',
				accessLevel: 'read',
				createdAt: new Date('2024-01-15'),
				expiresAt: new Date('2024-02-15'),
				token: 'secret2',
				invitedBy: 'user123',
			},
		];

		const sortMock = findReturning(async () => mockInvites);

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
			_id: 'invite123',
			email: 'user@example.com',
			accessLevel: 'admin',
			createdAt: new Date('2024-01-01T10:00:00.000Z'),
			expiresAt: new Date('2024-02-01T10:00:00.000Z'),
			token: 'secret-token',
			invitedBy: 'user456',
		};

		findReturning(async () => [mockInvite]);

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
		const error = new Error('Database connection failed');
		findReturning(async () => {
			throw error;
		});

		const result = await getPendingInvites(VALID_PLANNER_ID);

		expect(result).toEqual({
			invites: [],
			error: 'Failed to fetch pending invites',
		});
		expect(reportError).toHaveBeenCalledWith(error);
	});

	it('returns error and reports when checkAuth throws', async () => {
		const error = new Error('Unexpected error');
		mockCheckAuth.mockRejectedValue(error);

		const result = await getPendingInvites(VALID_PLANNER_ID);

		expect(result).toEqual({
			invites: [],
			error: 'Failed to fetch pending invites',
		});
		expect(reportError).toHaveBeenCalledWith(error);
	});

	it('returns error without reporting again when checkAuth returns error type', async () => {
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
		expect(reportError).not.toHaveBeenCalled();
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
