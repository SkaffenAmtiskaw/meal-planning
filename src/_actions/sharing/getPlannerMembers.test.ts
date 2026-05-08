import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));
vi.mock('@/_models/user', async () => ({
	User: {
		find: vi.fn(),
	},
}));
vi.mock('@/_utils/serialize', async () => ({
	serialize: vi.fn((data) => data),
}));

import { checkAuth } from '@/_actions/auth';
import { User } from '@/_models/user';

import { getPlannerMembers } from './getPlannerMembers';

describe('getPlannerMembers', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const objectId = new Types.ObjectId(plannerId);

	const mockFindUsers = (users: unknown[]) =>
		vi.mocked(User.find).mockReturnValue({
			lean: vi.fn().mockResolvedValue(users),
		} as any);

	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('authorization', () => {
		it.each([
			{ type: 'unauthenticated' as const },
			{ type: 'unauthorized' as const },
		])('returns unauthorized when caller is $type', async (authResult) => {
			vi.mocked(checkAuth).mockResolvedValue(authResult as never);

			const result = await getPlannerMembers(plannerId);

			expect(result).toEqual({ members: [], error: 'Unauthorized' });
			expect(User.find).not.toHaveBeenCalled();
		});

		it('throws when checkAuth returns error', async () => {
			vi.mocked(checkAuth).mockResolvedValue({
				type: 'error',
				error: new Error('Auth check failed'),
			} as never);

			await expect(getPlannerMembers(plannerId)).rejects.toThrow(
				'Auth check failed',
			);
		});
	});

	describe('success', () => {
		it('returns members for an owner caller', async () => {
			mockFindUsers([
				{
					name: 'Alice',
					email: 'alice@example.com',
					planners: [
						{
							planner: { toString: () => plannerId },
							accessLevel: 'owner',
						},
					],
				},
				{
					name: 'Bob',
					email: 'bob@example.com',
					planners: [
						{
							planner: { toString: () => plannerId },
							accessLevel: 'write',
						},
					],
				},
			]);

			const result = await getPlannerMembers(plannerId);

			expect(checkAuth).toHaveBeenCalledWith(objectId, 'admin');
			expect(User.find).toHaveBeenCalledWith({
				'planners.planner': plannerId,
			});
			expect(result).toEqual({
				members: [
					{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
					{ name: 'Bob', email: 'bob@example.com', accessLevel: 'write' },
				],
			});
		});

		it('returns members for an admin caller', async () => {
			vi.mocked(checkAuth).mockResolvedValue({
				type: 'authorized',
				accessLevel: 'admin',
				user: {
					_id: 'user-id',
					email: 'test@example.com',
					name: 'Test User',
					planners: [],
				},
			} as never);

			mockFindUsers([
				{
					name: 'Alice',
					email: 'alice@example.com',
					planners: [
						{
							planner: { toString: () => plannerId },
							accessLevel: 'owner',
						},
					],
				},
			]);

			const result = await getPlannerMembers(plannerId);

			expect(result).toEqual({
				members: [
					{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
				],
			});
		});

		it('accepts ObjectId as plannerId', async () => {
			mockFindUsers([
				{
					name: 'Alice',
					email: 'alice@example.com',
					planners: [
						{
							planner: { toString: () => plannerId },
							accessLevel: 'owner',
						},
					],
				},
			]);

			const result = await getPlannerMembers(objectId);

			expect(checkAuth).toHaveBeenCalledWith(objectId, 'admin');
			expect(User.find).toHaveBeenCalledWith({
				'planners.planner': objectId,
			});
			expect(result).toEqual({
				members: [
					{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
				],
			});
		});
	});

	describe('data mapping', () => {
		it('handles string planner ID in membership', async () => {
			mockFindUsers([
				{
					name: 'Alice',
					email: 'alice@example.com',
					planners: [
						{
							planner: plannerId,
							accessLevel: 'admin',
						},
					],
				},
			]);

			const result = await getPlannerMembers(plannerId);

			expect(result).toEqual({
				members: [
					{ name: 'Alice', email: 'alice@example.com', accessLevel: 'admin' },
				],
			});
		});

		it('defaults missing name and email', async () => {
			mockFindUsers([
				{
					name: undefined,
					email: undefined,
					planners: [
						{
							planner: { toString: () => plannerId },
							accessLevel: 'admin',
						},
					],
				},
			]);

			const result = await getPlannerMembers(plannerId);

			expect(result).toEqual({
				members: [{ name: 'New User', email: '', accessLevel: 'admin' }],
			});
		});

		it('defaults to read access when membership not found', async () => {
			mockFindUsers([
				{
					name: 'Charlie',
					email: 'charlie@example.com',
					planners: [
						{
							planner: { toString: () => 'other-planner-id' },
							accessLevel: 'owner',
						},
					],
				},
			]);

			const result = await getPlannerMembers(plannerId);

			expect(result).toEqual({
				members: [
					{
						name: 'Charlie',
						email: 'charlie@example.com',
						accessLevel: 'read',
					},
				],
			});
		});

		it('does not expose internal fields', async () => {
			mockFindUsers([
				{
					_id: 'internal-id-123',
					__v: 0,
					name: 'Alice',
					email: 'alice@example.com',
					planners: [
						{
							planner: { toString: () => plannerId },
							accessLevel: 'owner',
							_id: 'membership-id',
						},
					],
				},
			]);

			const result = await getPlannerMembers(plannerId);

			expect(result).toEqual({
				members: [
					{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
				],
			});
		});
	});

	describe('errors', () => {
		it('throws on database error', async () => {
			vi.mocked(User.find).mockImplementation(() => {
				throw new Error('DB connection failed');
			});

			await expect(getPlannerMembers(plannerId)).rejects.toThrow(
				'DB connection failed',
			);
		});
	});
});
