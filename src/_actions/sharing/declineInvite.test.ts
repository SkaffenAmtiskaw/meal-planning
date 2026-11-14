import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getUser } from '@/_actions/user';
import { PendingInvite } from '@/_models/sharing';
import { reportError } from '@/_utils/reportError';

import { type DeclineInviteInput, declineInvite } from './declineInvite';

vi.mock('@/_actions/user', async () => await import('#mocks/@/_actions/user'));
vi.mock(
	'@/_utils/reportError',
	async () => await import('#mocks/@/_utils/reportError'),
);

vi.mock('@/_models/sharing', () => ({
	PendingInvite: {
		findOne: vi.fn(),
		deleteOne: vi.fn(),
	},
}));
vi.mock(
	'@/_utils/serialize',
	async () => await import('#mocks/@/_utils/serialize'),
);

describe('declineInvite', () => {
	const inviteId = '507f1f77bcf86cd799439012';
	const input: DeclineInviteInput = {
		inviteId,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('declines and deletes a valid invite', async () => {
		vi.mocked(PendingInvite.findOne).mockResolvedValueOnce({
			email: 'user@example.com',
		} as never);

		const result = await declineInvite(input);

		expect(result).toEqual({ ok: true, data: undefined });
	});

	it('returns error when user is not authenticated', async () => {
		vi.mocked(getUser).mockResolvedValueOnce(null);

		const result = await declineInvite(input);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
	});

	it('returns error when inviteId is invalid', async () => {
		const result = await declineInvite({ inviteId: 'invalid-id' });

		expect(result).toEqual({ ok: false, error: 'Invalid invite ID' });
	});

	it('returns error when invite not found', async () => {
		vi.mocked(PendingInvite.findOne).mockResolvedValueOnce(null);

		const result = await declineInvite(input);

		expect(result).toEqual({ ok: false, error: 'Invite not found' });
	});

	it('returns error when invite email does not match user email', async () => {
		vi.mocked(PendingInvite.findOne).mockResolvedValueOnce({
			email: 'different@example.com',
		} as never);

		const result = await declineInvite(input);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
	});

	it('returns the session error without reporting when there is no valid session', async () => {
		vi.mocked(getUser).mockRejectedValueOnce(new Error('No Valid Session'));

		const result = await declineInvite(input);

		expect(result).toEqual({ ok: false, error: 'No Valid Session' });
		expect(reportError).not.toHaveBeenCalled();
	});

	it('returns error and reports on database failure during find', async () => {
		const error = new Error('Database connection failed');
		vi.mocked(PendingInvite.findOne).mockRejectedValueOnce(error);

		const result = await declineInvite(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain('Database connection failed');
		}
		expect(reportError).toHaveBeenCalledWith(error);
	});

	it('returns error and reports on database failure during delete', async () => {
		const error = new Error('Delete operation failed');
		vi.mocked(PendingInvite.findOne).mockResolvedValueOnce({
			email: 'user@example.com',
		} as never);
		vi.mocked(PendingInvite.deleteOne).mockRejectedValueOnce(error);

		const result = await declineInvite(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain('Delete operation failed');
		}
		expect(reportError).toHaveBeenCalledWith(error);
	});

	it('returns generic error when non-Error is thrown', async () => {
		vi.mocked(PendingInvite.findOne).mockRejectedValueOnce('String error');

		const result = await declineInvite(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBe('An error occurred');
		}
	});
});
