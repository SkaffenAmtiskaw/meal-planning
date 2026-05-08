import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth';
import type { AccessLevel } from '@/_models/user';

import { leavePlanner } from './leavePlanner';

import { removePlannerMembership } from './_utils/removePlannerMembership';

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));

vi.mock('./_utils/removePlannerMembership', () => ({
	removePlannerMembership: vi.fn(async () => ({ ok: true })),
}));

describe('leavePlanner', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const userId = '507f1f77bcf86cd799439012';

	const mockUser = {
		_id: new Types.ObjectId(userId),
		email: 'member@example.com',
		name: 'Member User',
		planners: [],
		__v: 0,
	};

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it.each([
		{ type: 'unauthenticated' as const },
		{ type: 'unauthorized' as const },
		{ type: 'error' as const, error: new Error('Auth check failed') },
	])('returns unauthorized error when auth result is $type', async (authValue) => {
		vi.mocked(checkAuth).mockResolvedValueOnce(authValue as never);

		const result = await leavePlanner(plannerId);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(removePlannerMembership).not.toHaveBeenCalled();
	});

	it('returns error when user is the owner', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({
			type: 'authorized',
			accessLevel: 'owner',
			user: mockUser,
		});

		const result = await leavePlanner(plannerId);

		expect(result).toEqual({
			ok: false,
			error: 'Owners cannot leave a planner. Transfer ownership first.',
		});
		expect(removePlannerMembership).not.toHaveBeenCalled();
	});

	it.each([
		'admin',
		'write',
		'read',
	] as AccessLevel[])('allows %s access user to leave planner', async (accessLevel) => {
		vi.mocked(checkAuth).mockResolvedValueOnce({
			type: 'authorized',
			accessLevel,
			user: mockUser,
		});

		const result = await leavePlanner(plannerId);

		expect(result).toEqual({ ok: true });
		expect(checkAuth).toHaveBeenCalledWith(expect.anything(), 'read');
		expect(removePlannerMembership).toHaveBeenCalledWith(userId, plannerId);
	});

	it('returns error when removePlannerMembership fails', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({
			type: 'authorized',
			accessLevel: 'admin',
			user: mockUser,
		});

		vi.mocked(removePlannerMembership).mockResolvedValueOnce({
			ok: false,
			error: 'Database error',
		});

		const result = await leavePlanner(plannerId);

		expect(result).toEqual({ ok: false, error: 'Database error' });
	});

	it('returns fallback error when removePlannerMembership fails without error message', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({
			type: 'authorized',
			accessLevel: 'admin',
			user: mockUser,
		});

		vi.mocked(removePlannerMembership).mockResolvedValueOnce({
			ok: false,
		});

		const result = await leavePlanner(plannerId);

		expect(result).toEqual({ ok: false, error: 'Failed to leave planner' });
	});
});
