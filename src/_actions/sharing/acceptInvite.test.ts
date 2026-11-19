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
import { pendingInvites } from '@/_models/database/pendingInvites';
import { users } from '@/_models/database/users';
import { reportError } from '@/_reporting/reportError';

import { acceptInvite } from './acceptInvite';

vi.mock('@/_actions/user', async () => await import('#mocks/@/_actions/user'));
vi.mock(
	'@/_models/database/newId',
	async () => await import('#mocks/@/_models/database/newId'),
);
vi.mock(
	'@/_reporting/reportError',
	async () => await import('#mocks/@/_reporting/reportError'),
);

vi.mock(
	'@/_models/database/users',
	async () => await import('#mocks/@/_models/database/users'),
);
vi.mock(
	'@/_models/database/pendingInvites',
	async () => await import('#mocks/@/_models/database/pendingInvites'),
);

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
		planner: plannerId,
		accessLevel: 'write',
		token,
		expiresAt: futureDate,
		...overrides,
	});

	it('should accept a valid invite and add user to planner with a new membership id', async () => {
		vi.mocked(getUser).mockResolvedValue({
			_id: userId,
			email: userEmail,
			name: 'Test User',
			planners: [],
		} as never);

		const invite = createInvite();
		vi.mocked(pendingInvites.findOne).mockResolvedValue(invite as never);

		const result = await acceptInvite({ token });

		expect(result).toEqual({ ok: true, data: { plannerId } });
		expect(getUser).toHaveBeenCalled();
		expect(pendingInvites.findOne).toHaveBeenCalledWith({ token });
		expect(users.updateOne).toHaveBeenCalledWith(
			{ _id: userId },
			{
				$push: {
					planners: {
						_id: 'new-id',
						planner: plannerId,
						accessLevel: 'write',
					},
				},
			},
		);
		expect(pendingInvites.deleteOne).toHaveBeenCalledWith({
			_id: 'invite-id',
		});
	});

	it('should return error when user is not authenticated', async () => {
		vi.mocked(getUser).mockResolvedValue(null as never);

		const result = await acceptInvite({ token });

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(pendingInvites.findOne).not.toHaveBeenCalled();
	});

	it('should return error when invite token is invalid', async () => {
		vi.mocked(pendingInvites.findOne).mockResolvedValue(null);

		const result = await acceptInvite({ token });

		expect(result).toEqual({ ok: false, error: 'Invite not found' });
	});

	it('should return error when invite has expired', async () => {
		const invite = createInvite({ expiresAt: pastDate });
		vi.mocked(pendingInvites.findOne).mockResolvedValue(invite as never);

		const result = await acceptInvite({ token });

		expect(result).toEqual({ ok: false, error: 'Invite has expired' });
		expect(pendingInvites.deleteOne).toHaveBeenCalledWith({
			_id: 'invite-id',
		});
		expect(users.updateOne).not.toHaveBeenCalled();
	});

	it('should return error when invite email does not match user email', async () => {
		const invite = createInvite({ email: 'different@example.com' });
		vi.mocked(pendingInvites.findOne).mockResolvedValue(invite as never);

		const result = await acceptInvite({ token });

		expect(result).toEqual({
			ok: false,
			error: 'This invite is for a different email address',
		});
		expect(users.updateOne).not.toHaveBeenCalled();
	});

	it('should succeed idempotently when user is already a member', async () => {
		const invite = createInvite({ accessLevel: 'read' });
		vi.mocked(pendingInvites.findOne).mockResolvedValue(invite as never);

		const result = await acceptInvite({ token });

		expect(result).toEqual({ ok: true, data: { plannerId } });
		expect(users.updateOne).not.toHaveBeenCalled();
		expect(pendingInvites.deleteOne).toHaveBeenCalledWith({
			_id: 'invite-id',
		});
	});

	it('should return the session error without reporting when there is no valid session', async () => {
		vi.mocked(getUser).mockRejectedValueOnce(new Error('No Valid Session'));

		const result = await acceptInvite({ token });

		expect(result).toEqual({ ok: false, error: 'No Valid Session' });
		expect(reportError).not.toHaveBeenCalled();
	});

	it('should handle database errors gracefully, and report them', async () => {
		const error = new Error('Database connection failed');
		vi.mocked(pendingInvites.findOne).mockRejectedValue(error);

		const result = await acceptInvite({ token });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBe('Database connection failed');
		}
		expect(reportError).toHaveBeenCalledWith(error);
	});

	it('should handle non-Error exceptions gracefully', async () => {
		vi.mocked(pendingInvites.findOne).mockRejectedValue('String error');

		const result = await acceptInvite({ token });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBe('An error occurred');
		}
	});
});
