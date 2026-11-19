import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { pendingInvites } from '@/_models/database/pendingInvites';
import { reportError } from '@/_reporting/reportError';

import { type CancelInviteInput, cancelInvite } from './cancelInvite';

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

describe('cancelInvite', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const inviteId = '507f1f77bcf86cd799439012';
	const input: CancelInviteInput = {
		inviteId,
		plannerId,
	};

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('returns error when user is not authenticated', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({
			type: 'unauthenticated',
		});

		const result = await cancelInvite(input);

		expect(result).toEqual({
			success: false,
			error: 'Unauthorized',
		});
		expect(checkAuth).toHaveBeenCalledWith(plannerId, 'admin');
		expect(pendingInvites.findOne).not.toHaveBeenCalled();
		expect(pendingInvites.deleteOne).not.toHaveBeenCalled();
	});

	it('returns error when caller lacks admin access', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({
			type: 'unauthorized',
		});

		const result = await cancelInvite(input);

		expect(result).toEqual({
			success: false,
			error: 'Unauthorized',
		});
		expect(pendingInvites.findOne).not.toHaveBeenCalled();
		expect(pendingInvites.deleteOne).not.toHaveBeenCalled();
	});

	it('returns error when checkAuth returns error type', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({
			type: 'error',
			error: new Error('Auth check failed'),
		});

		const result = await cancelInvite(input);

		expect(result).toEqual({
			success: false,
			error: 'Unauthorized',
		});
		expect(pendingInvites.findOne).not.toHaveBeenCalled();
		expect(pendingInvites.deleteOne).not.toHaveBeenCalled();
	});

	it('returns error when inviteId is invalid', async () => {
		const result = await cancelInvite({
			inviteId: 'invalid-id',
			plannerId,
		});

		expect(result).toEqual({
			success: false,
			error: 'Invalid invite ID',
		});
		expect(pendingInvites.findOne).not.toHaveBeenCalled();
		expect(pendingInvites.deleteOne).not.toHaveBeenCalled();
	});

	it('returns error when invite not found for this planner', async () => {
		vi.mocked(pendingInvites.findOne).mockResolvedValue(null);

		const result = await cancelInvite(input);

		expect(result).toEqual({
			success: false,
			error: 'Invite not found',
		});
		expect(pendingInvites.findOne).toHaveBeenCalledWith({
			_id: inviteId,
			planner: plannerId,
		});
		expect(pendingInvites.deleteOne).not.toHaveBeenCalled();
	});

	it('successfully deletes the pending invite', async () => {
		vi.mocked(pendingInvites.findOne).mockResolvedValue({
			_id: inviteId,
		} as never);
		vi.mocked(pendingInvites.deleteOne).mockResolvedValue({
			deletedCount: 1,
		} as never);

		const result = await cancelInvite(input);

		expect(result).toEqual({
			success: true,
		});
		expect(pendingInvites.findOne).toHaveBeenCalledWith({
			_id: inviteId,
			planner: plannerId,
		});
		expect(pendingInvites.deleteOne).toHaveBeenCalledWith({
			_id: inviteId,
		});
	});

	it('returns error without reporting when plannerId is invalid', async () => {
		const result = await cancelInvite({ inviteId, plannerId: 'invalid-id' });

		expect(result).toEqual({ success: false, error: 'Invalid planner ID' });
		expect(checkAuth).not.toHaveBeenCalled();
		expect(reportError).not.toHaveBeenCalled();
	});

	it('returns error and reports on database failure during find', async () => {
		const error = new Error('Database connection failed');
		vi.mocked(pendingInvites.findOne).mockRejectedValue(error);

		const result = await cancelInvite(input);

		expect(result.success).toBe(false);
		expect(result.error).toContain('Database connection failed');
		expect(pendingInvites.deleteOne).not.toHaveBeenCalled();
		expect(reportError).toHaveBeenCalledWith(error);
	});

	it('returns error and reports on database failure during delete', async () => {
		const error = new Error('Delete operation failed');
		vi.mocked(pendingInvites.findOne).mockResolvedValue({
			_id: inviteId,
		} as never);
		vi.mocked(pendingInvites.deleteOne).mockRejectedValue(error);

		const result = await cancelInvite(input);

		expect(result.success).toBe(false);
		expect(result.error).toContain('Delete operation failed');
		expect(reportError).toHaveBeenCalledWith(error);
	});

	it('returns generic error when non-Error is thrown', async () => {
		vi.mocked(pendingInvites.findOne).mockRejectedValue('String error');

		const result = await cancelInvite(input);

		expect(result.success).toBe(false);
		expect(result.error).toBe('An error occurred');
	});
});
