import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getUser } from '@/_actions/user';
import { PendingInvite } from '@/_models';

import { type DeclineInviteInput, declineInvite } from './declineInvite';

vi.mock('@/_actions/user', async () => await import('@mocks/@/_actions/user'));

vi.mock('@/_models', () => ({
	PendingInvite: {
		findOne: vi.fn(),
		deleteOne: vi.fn(),
	},
}));

vi.mock('@/_utils/serialize', () => ({
	serialize: vi.fn((data) => data),
}));

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

	it('returns error on database failure during find', async () => {
		vi.mocked(PendingInvite.findOne).mockRejectedValueOnce(
			new Error('Database connection failed'),
		);

		const result = await declineInvite(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain('Database connection failed');
		}
	});

	it('returns error on database failure during delete', async () => {
		vi.mocked(PendingInvite.findOne).mockResolvedValueOnce({
			email: 'user@example.com',
		} as never);
		vi.mocked(PendingInvite.deleteOne).mockRejectedValueOnce(
			new Error('Delete operation failed'),
		);

		const result = await declineInvite(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain('Delete operation failed');
		}
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
