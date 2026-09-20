import { renderHook, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PendingInvite } from '@/_actions/sharing';
import {
	cancelInvite,
	getPendingInvites,
	inviteUser,
} from '@/_actions/sharing';

import { useInvites } from './useInvites';

vi.mock(
	'@/_actions/sharing',
	async () => await import('@mocks/@/_actions/sharing'),
);

describe('useInvites', () => {
	const plannerId = '507f1f77bcf86cd799439011';

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('fetches invites on mount', async () => {
		const mockInvites: PendingInvite[] = [
			{
				id: '1',
				email: 'user1@example.com',
				accessLevel: 'write',
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
		];
		vi.mocked(getPendingInvites).mockResolvedValue({ invites: mockInvites });

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.invites).toEqual(mockInvites);
		});
		expect(getPendingInvites).toHaveBeenCalledWith(plannerId);
	});

	it('sets loading state during initial fetch', () => {
		vi.mocked(getPendingInvites).mockImplementation(
			() => new Promise(() => {}),
		);

		const { result } = renderHook(() => useInvites(plannerId));

		expect(result.current.loading).toBe(true);
	});

	it('sets error state on fetch failure', async () => {
		vi.mocked(getPendingInvites).mockResolvedValue({
			invites: [],
			error: 'Failed to fetch',
		});

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});
		expect(result.current.error).toBe('Failed to fetch');
		expect(result.current.invites).toEqual([]);
	});

	it('handles unexpected errors during initial fetch', async () => {
		vi.mocked(getPendingInvites).mockRejectedValue(new Error('Network error'));

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});
		expect(result.current.error).toBe('Failed to fetch invites');
		expect(result.current.invites).toEqual([]);
	});

	it('refresh re-fetches and updates invites', async () => {
		const initialInvites: PendingInvite[] = [
			{
				id: '1',
				email: 'user1@example.com',
				accessLevel: 'write',
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
		];
		const updatedInvites: PendingInvite[] = [
			...initialInvites,
			{
				id: '2',
				email: 'user2@example.com',
				accessLevel: 'read',
				invitedAt: '2024-01-02T00:00:00.000Z',
				expiresAt: '2024-01-09T00:00:00.000Z',
			},
		];

		vi.mocked(getPendingInvites)
			.mockResolvedValueOnce({ invites: initialInvites })
			.mockResolvedValueOnce({ invites: updatedInvites });

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.invites).toEqual(initialInvites);
		});

		await result.current.refresh();

		await waitFor(() => {
			expect(result.current.invites).toEqual(updatedInvites);
		});
		expect(getPendingInvites).toHaveBeenCalledTimes(2);
	});

	it('refresh keeps existing invites on error', async () => {
		const initialInvites: PendingInvite[] = [
			{
				id: '1',
				email: 'user1@example.com',
				accessLevel: 'write',
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
		];

		vi.mocked(getPendingInvites)
			.mockResolvedValueOnce({ invites: initialInvites })
			.mockResolvedValueOnce({ invites: [], error: 'Refresh failed' });

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.invites).toEqual(initialInvites);
		});

		await result.current.refresh();

		expect(result.current.invites).toEqual(initialInvites);
		expect(getPendingInvites).toHaveBeenCalledTimes(2);
	});

	it('inviteUser sets loading status and calls server action', async () => {
		vi.mocked(getPendingInvites).mockResolvedValue({ invites: [] });
		vi.mocked(inviteUser).mockImplementation(() => new Promise(() => {}));

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		result.current.inviteUser('newuser@example.com', 'write');

		await waitFor(() => {
			expect(result.current.inviteStatus).toBe('loading');
		});
		expect(inviteUser).toHaveBeenCalledWith({
			plannerId,
			email: 'newuser@example.com',
			accessLevel: 'write',
		});
	});

	it('inviteUser updates invites and status on success', async () => {
		const initialInvites: PendingInvite[] = [
			{
				id: '1',
				email: 'existing@example.com',
				accessLevel: 'write',
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
		];

		vi.mocked(getPendingInvites)
			.mockResolvedValueOnce({ invites: initialInvites })
			.mockResolvedValueOnce({
				invites: [
					...initialInvites,
					{
						id: '2',
						email: 'newuser@example.com',
						accessLevel: 'read',
						invitedAt: '2024-01-02T00:00:00.000Z',
						expiresAt: '2024-01-09T00:00:00.000Z',
					},
				],
			});
		vi.mocked(inviteUser).mockResolvedValue({
			ok: true,
			data: { inviteId: '2' },
		});

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		const success = await result.current.inviteUser('newuser@example.com');

		expect(success).toBe(true);
		await waitFor(() => {
			expect(result.current.inviteStatus).toBe('success');
		});
		expect(result.current.inviteError).toBeNull();
	});

	it('inviteUser sets error status on failure', async () => {
		vi.mocked(getPendingInvites).mockResolvedValue({ invites: [] });
		vi.mocked(inviteUser).mockResolvedValue({
			ok: false,
			error: 'User already invited',
		});

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		const success = await result.current.inviteUser('existing@example.com');

		expect(success).toBe(false);
		await waitFor(() => {
			expect(result.current.inviteStatus).toBe('error');
		});
		expect(result.current.inviteError).toBe('User already invited');
	});

	it('inviteUser uses default error message when result.error is undefined', async () => {
		vi.mocked(getPendingInvites).mockResolvedValue({ invites: [] });
		vi.mocked(inviteUser).mockResolvedValue({
			ok: false,
		} as never);

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		const success = await result.current.inviteUser('user@example.com');

		expect(success).toBe(false);
		await waitFor(() => {
			expect(result.current.inviteStatus).toBe('error');
		});
		expect(result.current.inviteError).toBe('Failed to invite user');
	});

	it('inviteUser uses default error message for non-Error throws', async () => {
		vi.mocked(getPendingInvites).mockResolvedValue({ invites: [] });
		vi.mocked(inviteUser).mockRejectedValue('String error');

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		const success = await result.current.inviteUser('user@example.com');

		expect(success).toBe(false);
		await waitFor(() => {
			expect(result.current.inviteStatus).toBe('error');
		});
		expect(result.current.inviteError).toBe('Failed to invite user');
	});

	it('handles unexpected errors in inviteUser', async () => {
		vi.mocked(getPendingInvites).mockResolvedValue({ invites: [] });
		vi.mocked(inviteUser).mockRejectedValue(new Error('Network error'));

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		const success = await result.current.inviteUser('user@example.com');

		expect(success).toBe(false);
		await waitFor(() => {
			expect(result.current.inviteStatus).toBe('error');
		});
		expect(result.current.inviteError).toBe('Network error');
	});

	it('removes invite immediately on cancel (optimistic update)', async () => {
		const mockInvites: PendingInvite[] = [
			{
				id: '1',
				email: 'user1@example.com',
				accessLevel: 'write',
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
			{
				id: '2',
				email: 'user2@example.com',
				accessLevel: 'read',
				invitedAt: '2024-01-02T00:00:00.000Z',
				expiresAt: '2024-01-09T00:00:00.000Z',
			},
		];

		vi.mocked(getPendingInvites).mockResolvedValue({ invites: mockInvites });
		vi.mocked(cancelInvite).mockImplementation(() => new Promise(() => {}));

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.invites).toHaveLength(2);
		});

		result.current.cancelInvite('1');

		await waitFor(() => {
			expect(result.current.invites).toHaveLength(1);
			expect(result.current.cancelStatus).toBe('loading');
		});
		expect(result.current.invites[0].id).toBe('2');
	});

	it('keeps invite removed on successful cancel', async () => {
		const mockInvites: PendingInvite[] = [
			{
				id: '1',
				email: 'user1@example.com',
				accessLevel: 'write',
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
			{
				id: '2',
				email: 'user2@example.com',
				accessLevel: 'read',
				invitedAt: '2024-01-02T00:00:00.000Z',
				expiresAt: '2024-01-09T00:00:00.000Z',
			},
		];

		vi.mocked(getPendingInvites).mockResolvedValue({ invites: mockInvites });
		vi.mocked(cancelInvite).mockResolvedValue({ success: true });

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.invites).toHaveLength(2);
		});

		const success = await result.current.cancelInvite('1');

		expect(success).toBe(true);
		await waitFor(() => {
			expect(result.current.cancelStatus).toBe('success');
		});
		expect(result.current.cancelError).toBeNull();
		expect(result.current.invites).toHaveLength(1);
		expect(result.current.invites[0].id).toBe('2');
	});

	it('restores invite on server failure', async () => {
		const inviteToCancel: PendingInvite = {
			id: '1',
			email: 'user1@example.com',
			accessLevel: 'write',
			invitedAt: '2024-01-01T00:00:00.000Z',
			expiresAt: '2024-01-08T00:00:00.000Z',
		};
		const mockInvites: PendingInvite[] = [
			inviteToCancel,
			{
				id: '2',
				email: 'user2@example.com',
				accessLevel: 'read',
				invitedAt: '2024-01-02T00:00:00.000Z',
				expiresAt: '2024-01-09T00:00:00.000Z',
			},
		];

		vi.mocked(getPendingInvites).mockResolvedValue({ invites: mockInvites });
		vi.mocked(cancelInvite).mockResolvedValue({
			success: false,
			error: 'Invite not found',
		});

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.invites).toHaveLength(2);
		});

		const success = await result.current.cancelInvite('1');

		expect(success).toBe(false);
		await waitFor(() => {
			expect(result.current.cancelStatus).toBe('error');
		});
		expect(result.current.cancelError).toBe('Invite not found');
		expect(result.current.invites).toHaveLength(2);
		expect(
			result.current.invites.find((i: PendingInvite) => i.id === '1'),
		).toEqual(inviteToCancel);
	});

	it('restores invite when server returns failure without error message', async () => {
		const inviteToCancel: PendingInvite = {
			id: '1',
			email: 'user1@example.com',
			accessLevel: 'write',
			invitedAt: '2024-01-01T00:00:00.000Z',
			expiresAt: '2024-01-08T00:00:00.000Z',
		};
		const mockInvites: PendingInvite[] = [inviteToCancel];

		vi.mocked(getPendingInvites).mockResolvedValue({ invites: mockInvites });
		vi.mocked(cancelInvite).mockResolvedValue({
			success: false,
		});

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.invites).toHaveLength(1);
		});

		const success = await result.current.cancelInvite('1');

		expect(success).toBe(false);
		await waitFor(() => {
			expect(result.current.cancelStatus).toBe('error');
		});
		expect(result.current.cancelError).toBe('Failed to cancel invite');
		expect(result.current.invites).toHaveLength(1);
		expect(result.current.invites[0]).toEqual(inviteToCancel);
	});

	it('restores invite on non-Error exception', async () => {
		const inviteToCancel: PendingInvite = {
			id: '1',
			email: 'user1@example.com',
			accessLevel: 'write',
			invitedAt: '2024-01-01T00:00:00.000Z',
			expiresAt: '2024-01-08T00:00:00.000Z',
		};
		const mockInvites: PendingInvite[] = [inviteToCancel];

		vi.mocked(getPendingInvites).mockResolvedValue({ invites: mockInvites });
		vi.mocked(cancelInvite).mockRejectedValue('String error');

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.invites).toHaveLength(1);
		});

		const success = await result.current.cancelInvite('1');

		expect(success).toBe(false);
		await waitFor(() => {
			expect(result.current.cancelStatus).toBe('error');
		});
		expect(result.current.cancelError).toBe('Failed to cancel invite');
		expect(result.current.invites).toHaveLength(1);
		expect(result.current.invites[0]).toEqual(inviteToCancel);
	});

	it('restores invite on Error exception', async () => {
		const inviteToCancel: PendingInvite = {
			id: '1',
			email: 'user1@example.com',
			accessLevel: 'write',
			invitedAt: '2024-01-01T00:00:00.000Z',
			expiresAt: '2024-01-08T00:00:00.000Z',
		};
		const mockInvites: PendingInvite[] = [inviteToCancel];

		vi.mocked(getPendingInvites).mockResolvedValue({ invites: mockInvites });
		vi.mocked(cancelInvite).mockRejectedValue(new Error('Database error'));

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.invites).toHaveLength(1);
		});

		const success = await result.current.cancelInvite('1');

		expect(success).toBe(false);
		await waitFor(() => {
			expect(result.current.cancelStatus).toBe('error');
		});
		expect(result.current.cancelError).toBe('Database error');
		expect(result.current.invites).toHaveLength(1);
		expect(result.current.invites[0]).toEqual(inviteToCancel);
	});

	it('handles cancel for non-existent invite (no restore needed)', async () => {
		const mockInvites: PendingInvite[] = [
			{
				id: '1',
				email: 'user1@example.com',
				accessLevel: 'write',
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
		];

		vi.mocked(getPendingInvites).mockResolvedValue({ invites: mockInvites });
		vi.mocked(cancelInvite).mockResolvedValue({
			success: false,
			error: 'Invite not found',
		});

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.invites).toHaveLength(1);
		});

		const success = await result.current.cancelInvite('non-existent-id');

		expect(success).toBe(false);
		await waitFor(() => {
			expect(result.current.cancelStatus).toBe('error');
		});
		expect(result.current.invites).toHaveLength(1);
		expect(result.current.invites[0].id).toBe('1');
	});

	it('handles exception when canceling non-existent invite (no restore needed)', async () => {
		const mockInvites: PendingInvite[] = [
			{
				id: '1',
				email: 'user1@example.com',
				accessLevel: 'write',
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
		];

		vi.mocked(getPendingInvites).mockResolvedValue({ invites: mockInvites });
		vi.mocked(cancelInvite).mockRejectedValue(new Error('Server error'));

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.invites).toHaveLength(1);
		});

		const success = await result.current.cancelInvite('non-existent-id');

		expect(success).toBe(false);
		await waitFor(() => {
			expect(result.current.cancelStatus).toBe('error');
		});
		expect(result.current.invites).toHaveLength(1);
		expect(result.current.invites[0].id).toBe('1');
	});

	it('refetches when plannerId changes', async () => {
		const mockInvites: PendingInvite[] = [
			{
				id: '1',
				email: 'user1@example.com',
				accessLevel: 'write',
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
		];

		vi.mocked(getPendingInvites).mockResolvedValue({ invites: mockInvites });

		const { result, rerender } = renderHook(
			({ id }: { id: string }) => useInvites(id),
			{ initialProps: { id: plannerId } },
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(getPendingInvites).toHaveBeenCalledTimes(1);

		rerender({ id: 'different-planner-id' });

		await waitFor(() => {
			expect(getPendingInvites).toHaveBeenCalledTimes(2);
		});

		expect(getPendingInvites).toHaveBeenLastCalledWith('different-planner-id');
	});
});
