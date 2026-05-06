import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';

import { getUser } from '@/_actions/user';
import { PendingInvite, User } from '@/_models';

import { acceptInvite } from './acceptInvite';

vi.mock('@/_actions/user', async () => await import('@mocks/@/_actions/user'));

vi.mock('@/_models', () => ({
	PendingInvite: {
		findOne: vi.fn(),
	},
	User: {
		updateOne: vi.fn(),
	},
}));

describe('acceptInvite', () => {
	const token = 'valid-token-123';
	const userId = 'user-id';
	const userEmail = 'user@example.com';
	const plannerId = '507f1f77bcf86cd799439011';
	const mockNow = new Date('2024-01-15T00:00:00.000Z');
	const futureDate = new Date('2024-01-20T00:00:00.000Z');
	const pastDate = new Date('2024-01-10T00:00:00.000Z');

	beforeAll(() => {
		vi.useFakeTimers();
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	beforeEach(() => {
		vi.resetAllMocks();
		vi.setSystemTime(mockNow);
	});

	const createInvite = (overrides: Record<string, unknown> = {}) => ({
		_id: 'invite-id',
		email: userEmail,
		planner: { toString: () => plannerId },
		accessLevel: 'write',
		token,
		expiresAt: futureDate,
		deleteOne: vi.fn(),
		...overrides,
	});

	it('should accept a valid invite and add user to planner', async () => {
		vi.mocked(getUser).mockResolvedValue({
			_id: userId,
			email: userEmail,
			name: 'Test User',
			planners: [],
		} as never);

		const invite = createInvite();
		vi.mocked(PendingInvite.findOne).mockResolvedValue(invite as never);

		const result = await acceptInvite({ token });

		expect(result).toEqual({ ok: true, data: { plannerId } });
		expect(getUser).toHaveBeenCalled();
		expect(PendingInvite.findOne).toHaveBeenCalledWith({ token });
		expect(User.updateOne).toHaveBeenCalledWith(
			{ _id: userId },
			{
				$push: {
					planners: {
						planner: plannerId,
						accessLevel: 'write',
					},
				},
			},
		);
		expect(invite.deleteOne).toHaveBeenCalled();
	});

	it('should return error when user is not authenticated', async () => {
		vi.mocked(getUser).mockResolvedValue(null as never);

		const result = await acceptInvite({ token });

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(PendingInvite.findOne).not.toHaveBeenCalled();
	});

	it('should return error when invite token is invalid', async () => {
		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);

		const result = await acceptInvite({ token });

		expect(result).toEqual({ ok: false, error: 'Invite not found' });
	});

	it('should return error when invite has expired', async () => {
		const invite = createInvite({ expiresAt: pastDate });
		vi.mocked(PendingInvite.findOne).mockResolvedValue(invite as never);

		const result = await acceptInvite({ token });

		expect(result).toEqual({ ok: false, error: 'Invite has expired' });
		expect(invite.deleteOne).toHaveBeenCalled();
		expect(User.updateOne).not.toHaveBeenCalled();
	});

	it('should return error when invite email does not match user email', async () => {
		const invite = createInvite({ email: 'different@example.com' });
		vi.mocked(PendingInvite.findOne).mockResolvedValue(invite as never);

		const result = await acceptInvite({ token });

		expect(result).toEqual({
			ok: false,
			error: 'This invite is for a different email address',
		});
		expect(User.updateOne).not.toHaveBeenCalled();
	});

	it('should succeed idempotently when user is already a member', async () => {
		const invite = createInvite({ accessLevel: 'read' });
		vi.mocked(PendingInvite.findOne).mockResolvedValue(invite as never);

		const result = await acceptInvite({ token });

		expect(result).toEqual({ ok: true, data: { plannerId } });
		expect(User.updateOne).not.toHaveBeenCalled();
		expect(invite.deleteOne).toHaveBeenCalled();
	});

	it('should handle database errors gracefully', async () => {
		vi.mocked(PendingInvite.findOne).mockRejectedValue(
			new Error('Database connection failed'),
		);

		const result = await acceptInvite({ token });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBe('Database connection failed');
		}
	});

	it('should handle non-Error exceptions gracefully', async () => {
		vi.mocked(PendingInvite.findOne).mockRejectedValue('String error');

		const result = await acceptInvite({ token });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBe('An error occurred');
		}
	});
});
