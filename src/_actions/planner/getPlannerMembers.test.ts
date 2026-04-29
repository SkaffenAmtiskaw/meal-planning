import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { User } from '@/_models';
import type { AccessLevel } from '@/_models/user';

import { getPlannerMembers } from './getPlannerMembers';

vi.mock('@/_actions/auth/checkAuth', () => ({
	checkAuth: vi.fn(),
}));

vi.mock('@/_models', () => ({
	User: {
		find: vi.fn(),
	},
}));

describe('getPlannerMembers', () => {
	const plannerId = '507f1f77bcf86cd799439011';

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('accepts ObjectId as plannerId', async () => {
		const objectId = new Types.ObjectId(plannerId);

		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner' as AccessLevel,
			user: {
				_id: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				planners: [],
			},
		} as never);

		const mockPlannerId = { toString: () => plannerId };
		const mockMembers = [
			{
				name: 'Alice',
				email: 'alice@example.com',
				planners: [{ planner: mockPlannerId, accessLevel: 'owner' }],
			},
		];

		const mockSelect = vi.fn().mockReturnThis();
		const mockLean = vi.fn().mockResolvedValue(mockMembers);

		vi.mocked(User.find).mockReturnValue({
			select: mockSelect,
			lean: mockLean,
		} as never);

		const result = await getPlannerMembers(objectId);

		expect(checkAuth).toHaveBeenCalledWith(expect.anything(), 'admin');
		expect(result).toEqual({
			members: [
				{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
			],
		});
	});

	test('handles string planner ID in membership', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner' as AccessLevel,
			user: {
				_id: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				planners: [],
			},
		} as never);

		// Test with planner as string instead of ObjectId
		const mockMembers = [
			{
				name: 'Alice',
				email: 'alice@example.com',
				planners: [{ planner: plannerId, accessLevel: 'admin' }],
			},
		];

		const mockSelect = vi.fn().mockReturnThis();
		const mockLean = vi.fn().mockResolvedValue(mockMembers);

		vi.mocked(User.find).mockReturnValue({
			select: mockSelect,
			lean: mockLean,
		} as never);

		const result = await getPlannerMembers(plannerId);

		expect(result).toEqual({
			members: [
				{ name: 'Alice', email: 'alice@example.com', accessLevel: 'admin' },
			],
		});
	});

	test('returns members for owner caller', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner' as AccessLevel,
			user: {
				_id: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				planners: [],
			},
		} as never);

		const mockPlannerId = { toString: () => plannerId };
		const mockMembers = [
			{
				name: 'Alice',
				email: 'alice@example.com',
				planners: [{ planner: mockPlannerId, accessLevel: 'owner' }],
			},
			{
				name: 'Bob',
				email: 'bob@example.com',
				planners: [{ planner: mockPlannerId, accessLevel: 'write' }],
			},
		];

		const mockSelect = vi.fn().mockReturnThis();
		const mockLean = vi.fn().mockResolvedValue(mockMembers);

		vi.mocked(User.find).mockReturnValue({
			select: mockSelect,
			lean: mockLean,
		} as never);

		const result = await getPlannerMembers(plannerId);

		expect(checkAuth).toHaveBeenCalledWith(expect.anything(), 'admin');
		expect(User.find).toHaveBeenCalledWith({ 'planners.planner': plannerId });
		expect(result).toEqual({
			members: [
				{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
				{ name: 'Bob', email: 'bob@example.com', accessLevel: 'write' },
			],
		});
	});

	test('returns members for admin caller', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: {
				_id: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				planners: [],
			},
		} as never);

		const mockPlannerId = { toString: () => plannerId };
		const mockMembers = [
			{
				name: 'Alice',
				email: 'alice@example.com',
				planners: [{ planner: mockPlannerId, accessLevel: 'owner' }],
			},
		];

		const mockSelect = vi.fn().mockReturnThis();
		const mockLean = vi.fn().mockResolvedValue(mockMembers);

		vi.mocked(User.find).mockReturnValue({
			select: mockSelect,
			lean: mockLean,
		} as never);

		const result = await getPlannerMembers(plannerId);

		expect(checkAuth).toHaveBeenCalledWith(expect.anything(), 'admin');
		expect(result).toEqual({
			members: [
				{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
			],
		});
	});

	test('returns unauthorized for non-admin caller', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'unauthorized',
		});

		const result = await getPlannerMembers(plannerId);

		expect(result).toEqual({ members: [], error: 'Unauthorized' });
	});

	test('returns unauthorized for unauthenticated caller', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'unauthenticated',
		});

		const result = await getPlannerMembers(plannerId);

		expect(result).toEqual({ members: [], error: 'Unauthorized' });
	});

	test('handles missing name and email with defaults', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner' as AccessLevel,
			user: {
				_id: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				planners: [],
			},
		} as never);

		const otherPlannerId = '507f1f77bcf86cd799439022';
		const mockPlannerId = { toString: () => plannerId };
		const mockOtherPlannerId = { toString: () => otherPlannerId };
		const mockMembers = [
			{
				name: undefined,
				email: undefined,
				planners: [
					{ planner: mockPlannerId, accessLevel: 'admin' },
					{ planner: mockOtherPlannerId, accessLevel: 'owner' },
				],
			},
		];

		const mockSelect = vi.fn().mockReturnThis();
		const mockLean = vi.fn().mockResolvedValue(mockMembers);

		vi.mocked(User.find).mockReturnValue({
			select: mockSelect,
			lean: mockLean,
		} as never);

		const result = await getPlannerMembers(plannerId);

		expect(result).toEqual({
			members: [{ name: 'New User', email: '', accessLevel: 'admin' }],
		});
	});

	test('defaults to read access when membership not found', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner' as AccessLevel,
			user: {
				_id: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				planners: [],
			},
		} as never);

		const otherPlannerId = '507f1f77bcf86cd799439022';
		const mockOtherPlannerId = { toString: () => otherPlannerId };
		const mockMembers = [
			{
				name: 'Charlie',
				email: 'charlie@example.com',
				planners: [
					// This membership is for a different planner
					{ planner: mockOtherPlannerId, accessLevel: 'owner' },
				],
			},
		];

		const mockSelect = vi.fn().mockReturnThis();
		const mockLean = vi.fn().mockResolvedValue(mockMembers);

		vi.mocked(User.find).mockReturnValue({
			select: mockSelect,
			lean: mockLean,
		} as never);

		const result = await getPlannerMembers(plannerId);

		expect(result).toEqual({
			members: [
				{ name: 'Charlie', email: 'charlie@example.com', accessLevel: 'read' },
			],
		});
	});

	test('does not expose internal fields like _id', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner' as AccessLevel,
			user: {
				_id: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				planners: [],
			},
		} as never);

		const mockPlannerId = { toString: () => plannerId };
		const mockMembers = [
			{
				_id: 'internal-id-123',
				__v: 0,
				name: 'Alice',
				email: 'alice@example.com',
				planners: [
					{
						planner: mockPlannerId,
						accessLevel: 'owner',
						_id: 'membership-id',
					},
				],
			},
		];

		const mockSelect = vi.fn().mockReturnThis();
		const mockLean = vi.fn().mockResolvedValue(mockMembers);

		vi.mocked(User.find).mockReturnValue({
			select: mockSelect,
			lean: mockLean,
		} as never);

		const result = await getPlannerMembers(plannerId);

		expect(result).toEqual({
			members: [
				{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
			],
		});

		// Ensure internal fields are not present
		const member = (
			result as {
				members: { name: string; email: string; accessLevel: string }[];
			}
		).members[0];
		expect(member).not.toHaveProperty('_id');
		expect(member).not.toHaveProperty('__v');
	});

	test('handles errors from database query', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner' as AccessLevel,
			user: {
				_id: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				planners: [],
			},
		} as never);

		vi.mocked(User.find).mockImplementation(() => {
			throw new Error('DB connection failed');
		});

		await expect(getPlannerMembers(plannerId)).rejects.toThrow(
			'DB connection failed',
		);
	});

	test('handles checkAuth error', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'error',
			error: new Error('Auth check failed'),
		});

		await expect(getPlannerMembers(plannerId)).rejects.toThrow(
			'Auth check failed',
		);
	});
});
