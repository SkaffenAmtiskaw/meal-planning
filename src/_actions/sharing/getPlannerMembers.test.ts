import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));
vi.mock('@/_models', () => ({
	User: {
		find: vi.fn(),
	},
}));
vi.mock('@/_utils/serialize', () => ({
	serialize: vi.fn((data) => data),
}));

import { checkAuth } from '@/_actions/auth';
import { User } from '@/_models';

import { getPlannerMembers } from './getPlannerMembers';

describe('getPlannerMembers', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const objectId = new Types.ObjectId(plannerId);

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('returns members for owner caller', async () => {
		vi.mocked(User.find).mockReturnValue({
			lean: vi.fn().mockResolvedValue([
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
			]),
		} as unknown as ReturnType<typeof User.find>);

		const result = await getPlannerMembers(plannerId);

		expect(result).toEqual({
			members: [
				{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
				{ name: 'Bob', email: 'bob@example.com', accessLevel: 'write' },
			],
		});
	});

	it('returns members for admin caller', async () => {
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

		vi.mocked(User.find).mockReturnValue({
			lean: vi.fn().mockResolvedValue([
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
			]),
		} as unknown as ReturnType<typeof User.find>);

		const result = await getPlannerMembers(plannerId);

		expect(result).toEqual({
			members: [
				{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
			],
		});
	});

	it('returns unauthorized for unauthenticated caller', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthenticated' });

		const result = await getPlannerMembers(plannerId);

		expect(result).toEqual({ members: [], error: 'Unauthorized' });
		expect(User.find).not.toHaveBeenCalled();
	});

	it('returns unauthorized for unauthorized caller', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthorized' });

		const result = await getPlannerMembers(plannerId);

		expect(result).toEqual({ members: [], error: 'Unauthorized' });
		expect(User.find).not.toHaveBeenCalled();
	});

	it('throws when checkAuth returns error', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'error',
			error: new Error('Auth check failed'),
		});

		await expect(getPlannerMembers(plannerId)).rejects.toThrow(
			'Auth check failed',
		);
	});

	it('accepts ObjectId as plannerId', async () => {
		vi.mocked(User.find).mockReturnValue({
			lean: vi.fn().mockResolvedValue([
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
			]),
		} as unknown as ReturnType<typeof User.find>);

		const result = await getPlannerMembers(objectId);

		expect(result).toEqual({
			members: [
				{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
			],
		});
	});

	it('handles string planner ID in membership', async () => {
		vi.mocked(User.find).mockReturnValue({
			lean: vi.fn().mockResolvedValue([
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
			]),
		} as unknown as ReturnType<typeof User.find>);

		const result = await getPlannerMembers(plannerId);

		expect(result).toEqual({
			members: [
				{ name: 'Alice', email: 'alice@example.com', accessLevel: 'admin' },
			],
		});
	});

	it('defaults missing name and email', async () => {
		vi.mocked(User.find).mockReturnValue({
			lean: vi.fn().mockResolvedValue([
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
			]),
		} as unknown as ReturnType<typeof User.find>);

		const result = await getPlannerMembers(plannerId);

		expect(result).toEqual({
			members: [{ name: 'New User', email: '', accessLevel: 'admin' }],
		});
	});

	it('defaults to read access when membership not found', async () => {
		vi.mocked(User.find).mockReturnValue({
			lean: vi.fn().mockResolvedValue([
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
			]),
		} as unknown as ReturnType<typeof User.find>);

		const result = await getPlannerMembers(plannerId);

		expect(result).toEqual({
			members: [
				{ name: 'Charlie', email: 'charlie@example.com', accessLevel: 'read' },
			],
		});
	});

	it('does not expose internal fields', async () => {
		vi.mocked(User.find).mockReturnValue({
			lean: vi.fn().mockResolvedValue([
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
			]),
		} as unknown as ReturnType<typeof User.find>);

		const result = await getPlannerMembers(plannerId);

		expect(result).toEqual({
			members: [
				{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
			],
		});
	});

	it('throws on database error', async () => {
		vi.mocked(User.find).mockImplementation(() => {
			throw new Error('DB connection failed');
		});

		await expect(getPlannerMembers(plannerId)).rejects.toThrow(
			'DB connection failed',
		);
	});
});
