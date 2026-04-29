import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { removePlannerMembership } from '@/_actions/planner/_utils/removePlannerMembership';
import type { AccessLevel } from '@/_models/user';

import { leavePlanner } from './leavePlanner';

vi.mock('@/_actions/auth/checkAuth', () => ({
	checkAuth: vi.fn(),
}));

vi.mock('@/_actions/planner/_utils/removePlannerMembership', () => ({
	removePlannerMembership: vi.fn(),
}));

describe('leavePlanner', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const userId = 'user-id-123';

	const mockUser = {
		_id: userId as never,
		email: 'member@example.com',
		name: 'Member User',
		planners: [],
	} as never;

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('returns error when user is unauthenticated', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'unauthenticated',
		});

		const result = await leavePlanner(plannerId);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(removePlannerMembership).not.toHaveBeenCalled();
	});

	it('returns error when user is not a member of the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'unauthorized',
		});

		const result = await leavePlanner(plannerId);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(removePlannerMembership).not.toHaveBeenCalled();
	});

	it('returns error when user is the owner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'owner' as AccessLevel,
			user: mockUser,
		} as never);

		const result = await leavePlanner(plannerId);

		expect(result).toEqual({
			ok: false,
			error: 'Owners cannot leave a planner. Transfer ownership first.',
		});
		expect(removePlannerMembership).not.toHaveBeenCalled();
	});

	it('successfully removes non-owner member from planner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockUser,
		} as never);

		vi.mocked(removePlannerMembership).mockResolvedValue({ ok: true });

		const result = await leavePlanner(plannerId);

		expect(result).toEqual({ ok: true });
		expect(checkAuth).toHaveBeenCalledWith(expect.anything(), 'read');
		expect(removePlannerMembership).toHaveBeenCalledWith(userId, plannerId);
	});

	it('returns error when removePlannerMembership fails', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockUser,
		} as never);

		vi.mocked(removePlannerMembership).mockResolvedValue({
			ok: false,
			error: 'Database error',
		});

		const result = await leavePlanner(plannerId);

		expect(result).toEqual({ ok: false, error: 'Database error' });
	});

	it('returns fallback error when removePlannerMembership fails without error message', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'admin' as AccessLevel,
			user: mockUser,
		} as never);

		vi.mocked(removePlannerMembership).mockResolvedValue({
			ok: false,
			// No error property - should trigger fallback
		});

		const result = await leavePlanner(plannerId);

		expect(result).toEqual({ ok: false, error: 'Failed to leave planner' });
	});

	it.each([
		'admin',
		'write',
		'read',
	] as AccessLevel[])('allows %s access user to leave planner', async (accessLevel) => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel,
			user: mockUser,
		} as never);

		vi.mocked(removePlannerMembership).mockResolvedValue({ ok: true });

		const result = await leavePlanner(plannerId);

		expect(result).toEqual({ ok: true });
		expect(removePlannerMembership).toHaveBeenCalledWith(userId, plannerId);
	});

	it('returns unauthorized error when checkAuth returns error', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'error',
			error: new Error('Auth check failed'),
		});

		const result = await leavePlanner(plannerId);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(removePlannerMembership).not.toHaveBeenCalled();
	});
});
