import { renderHook, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PendingInvite } from '@/_actions/planner/invite.types';
import type { AccessLevel } from '@/_models/user';

const mockGetPendingInvites = vi.fn();
const mockInviteUserAction = vi.fn();
const mockCancelInviteAction = vi.fn();

vi.mock('@/_actions/planner/getPendingInvites', () => ({
	getPendingInvites: (...args: unknown[]) => mockGetPendingInvites(...args),
}));

vi.mock('@/_actions/planner/inviteUser', () => ({
	inviteUser: (...args: unknown[]) => mockInviteUserAction(...args),
}));

vi.mock('@/_actions/planner/cancelInvite', () => ({
	cancelInvite: (...args: unknown[]) => mockCancelInviteAction(...args),
}));

describe('useInvites', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	let useInvites: typeof import('./useInvites').useInvites;

	beforeEach(() => {
		vi.resetAllMocks();
		// Clear module cache to get fresh hook instance
		vi.resetModules();
	});

	async function loadHook() {
		const module = await import('./useInvites');
		useInvites = module.useInvites;
	}

	it('fetches invites on mount', async () => {
		const mockInvites: PendingInvite[] = [
			{
				id: '1',
				email: 'user1@example.com',
				accessLevel: 'write' as AccessLevel,
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
		];
		mockGetPendingInvites.mockResolvedValue({ invites: mockInvites });
		await loadHook();

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.invites).toEqual(mockInvites);
		});
		expect(mockGetPendingInvites).toHaveBeenCalledWith(plannerId);
	});

	it('sets loading state during initial fetch', async () => {
		mockGetPendingInvites.mockImplementation(() => new Promise(() => {}));
		await loadHook();

		const { result } = renderHook(() => useInvites(plannerId));

		expect(result.current.loading).toBe(true);
	});

	it('sets error state on fetch failure', async () => {
		mockGetPendingInvites.mockResolvedValue({
			invites: [],
			error: 'Failed to fetch',
		});
		await loadHook();

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});
		expect(result.current.error).toBe('Failed to fetch');
		expect(result.current.invites).toEqual([]);
	});

	it('handles unexpected errors during initial fetch', async () => {
		mockGetPendingInvites.mockRejectedValue(new Error('Network error'));
		await loadHook();

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
				accessLevel: 'write' as AccessLevel,
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
		];
		const updatedInvites: PendingInvite[] = [
			...initialInvites,
			{
				id: '2',
				email: 'user2@example.com',
				accessLevel: 'read' as AccessLevel,
				invitedAt: '2024-01-02T00:00:00.000Z',
				expiresAt: '2024-01-09T00:00:00.000Z',
			},
		];

		mockGetPendingInvites
			.mockResolvedValueOnce({ invites: initialInvites })
			.mockResolvedValueOnce({ invites: updatedInvites });
		await loadHook();

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.invites).toEqual(initialInvites);
		});

		await result.current.refresh();

		await waitFor(() => {
			expect(result.current.invites).toEqual(updatedInvites);
		});
		expect(mockGetPendingInvites).toHaveBeenCalledTimes(2);
	});

	it('refresh keeps existing invites on error', async () => {
		const initialInvites: PendingInvite[] = [
			{
				id: '1',
				email: 'user1@example.com',
				accessLevel: 'write' as AccessLevel,
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
		];

		mockGetPendingInvites
			.mockResolvedValueOnce({ invites: initialInvites })
			.mockResolvedValueOnce({ invites: [], error: 'Refresh failed' });
		await loadHook();

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.invites).toEqual(initialInvites);
		});

		await result.current.refresh();

		// Invites should remain unchanged on refresh error
		expect(result.current.invites).toEqual(initialInvites);
		expect(mockGetPendingInvites).toHaveBeenCalledTimes(2);
	});

	it('inviteUser sets loading status and calls server action', async () => {
		mockGetPendingInvites.mockResolvedValue({ invites: [] });
		mockInviteUserAction.mockImplementation(() => new Promise(() => {}));
		await loadHook();

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Start invite operation
		result.current.inviteUser('newuser@example.com', 'write' as AccessLevel);

		await waitFor(() => {
			expect(result.current.inviteStatus).toBe('loading');
		});
		expect(mockInviteUserAction).toHaveBeenCalledWith({
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
				accessLevel: 'write' as AccessLevel,
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
		];

		mockGetPendingInvites
			.mockResolvedValueOnce({ invites: initialInvites })
			.mockResolvedValueOnce({
				invites: [
					...initialInvites,
					{
						id: '2',
						email: 'newuser@example.com',
						accessLevel: 'read' as AccessLevel,
						invitedAt: '2024-01-02T00:00:00.000Z',
						expiresAt: '2024-01-09T00:00:00.000Z',
					},
				],
			});
		mockInviteUserAction.mockResolvedValue({ ok: true, inviteId: '2' });
		await loadHook();

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
		mockGetPendingInvites.mockResolvedValue({ invites: [] });
		mockInviteUserAction.mockResolvedValue({
			ok: false,
			error: 'User already invited',
		});
		await loadHook();

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
		mockGetPendingInvites.mockResolvedValue({ invites: [] });
		mockInviteUserAction.mockResolvedValue({
			ok: false,
		});
		await loadHook();

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
		mockGetPendingInvites.mockResolvedValue({ invites: [] });
		mockInviteUserAction.mockRejectedValue('String error');
		await loadHook();

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

	it('removes invite immediately on cancel (optimistic update)', async () => {
		const mockInvites: PendingInvite[] = [
			{
				id: '1',
				email: 'user1@example.com',
				accessLevel: 'write' as AccessLevel,
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
			{
				id: '2',
				email: 'user2@example.com',
				accessLevel: 'read' as AccessLevel,
				invitedAt: '2024-01-02T00:00:00.000Z',
				expiresAt: '2024-01-09T00:00:00.000Z',
			},
		];

		mockGetPendingInvites.mockResolvedValue({ invites: mockInvites });
		// Delay the resolve to verify optimistic update happens first
		mockCancelInviteAction.mockImplementation(() => new Promise(() => {}));
		await loadHook();

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.invites).toHaveLength(2);
		});

		// Start cancel operation
		result.current.cancelInvite('1');

		// Verify invite is removed immediately (optimistically)
		await waitFor(() => {
			expect(result.current.invites).toHaveLength(1);
		});
		expect(result.current.invites[0].id).toBe('2');
	});

	it('keeps invite removed on successful cancel', async () => {
		const mockInvites: PendingInvite[] = [
			{
				id: '1',
				email: 'user1@example.com',
				accessLevel: 'write' as AccessLevel,
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
			{
				id: '2',
				email: 'user2@example.com',
				accessLevel: 'read' as AccessLevel,
				invitedAt: '2024-01-02T00:00:00.000Z',
				expiresAt: '2024-01-09T00:00:00.000Z',
			},
		];

		mockGetPendingInvites.mockResolvedValue({ invites: mockInvites });
		mockCancelInviteAction.mockResolvedValue({ success: true });
		await loadHook();

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
			accessLevel: 'write' as AccessLevel,
			invitedAt: '2024-01-01T00:00:00.000Z',
			expiresAt: '2024-01-08T00:00:00.000Z',
		};
		const mockInvites: PendingInvite[] = [
			inviteToCancel,
			{
				id: '2',
				email: 'user2@example.com',
				accessLevel: 'read' as AccessLevel,
				invitedAt: '2024-01-02T00:00:00.000Z',
				expiresAt: '2024-01-09T00:00:00.000Z',
			},
		];

		mockGetPendingInvites.mockResolvedValue({ invites: mockInvites });
		mockCancelInviteAction.mockResolvedValue({
			success: false,
			error: 'Invite not found',
		});
		await loadHook();

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
		// On failure, invite should be restored
		expect(result.current.invites).toHaveLength(2);
		expect(
			result.current.invites.find((i: PendingInvite) => i.id === '1'),
		).toEqual(inviteToCancel);
	});

	it('restores invite when server returns failure without error message', async () => {
		const inviteToCancel: PendingInvite = {
			id: '1',
			email: 'user1@example.com',
			accessLevel: 'write' as AccessLevel,
			invitedAt: '2024-01-01T00:00:00.000Z',
			expiresAt: '2024-01-08T00:00:00.000Z',
		};
		const mockInvites: PendingInvite[] = [inviteToCancel];

		mockGetPendingInvites.mockResolvedValue({ invites: mockInvites });
		mockCancelInviteAction.mockResolvedValue({
			success: false,
		});
		await loadHook();

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
		// Invite should be restored
		expect(result.current.invites).toHaveLength(1);
		expect(result.current.invites[0]).toEqual(inviteToCancel);
	});

	it('restores invite on non-Error exception', async () => {
		const inviteToCancel: PendingInvite = {
			id: '1',
			email: 'user1@example.com',
			accessLevel: 'write' as AccessLevel,
			invitedAt: '2024-01-01T00:00:00.000Z',
			expiresAt: '2024-01-08T00:00:00.000Z',
		};
		const mockInvites: PendingInvite[] = [inviteToCancel];

		mockGetPendingInvites.mockResolvedValue({ invites: mockInvites });
		mockCancelInviteAction.mockRejectedValue('String error');
		await loadHook();

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
		// Invite should be restored
		expect(result.current.invites).toHaveLength(1);
		expect(result.current.invites[0]).toEqual(inviteToCancel);
	});

	it('resets invite status after successful invite', async () => {
		mockGetPendingInvites.mockResolvedValue({ invites: [] });
		mockInviteUserAction.mockResolvedValue({ ok: true, inviteId: '1' });
		await loadHook();

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// First invite
		await result.current.inviteUser('user1@example.com');

		await waitFor(() => {
			expect(result.current.inviteStatus).toBe('success');
		});

		// After starting another invite operation, status should reset to loading
		mockInviteUserAction.mockImplementation(() => new Promise(() => {}));
		result.current.inviteUser('user2@example.com');

		await waitFor(() => {
			expect(result.current.inviteStatus).toBe('loading');
		});
	});

	it('handles unexpected errors in inviteUser', async () => {
		mockGetPendingInvites.mockResolvedValue({ invites: [] });
		mockInviteUserAction.mockRejectedValue(new Error('Network error'));
		await loadHook();

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

	it('restores invite on Error exception', async () => {
		const inviteToCancel: PendingInvite = {
			id: '1',
			email: 'user1@example.com',
			accessLevel: 'write' as AccessLevel,
			invitedAt: '2024-01-01T00:00:00.000Z',
			expiresAt: '2024-01-08T00:00:00.000Z',
		};
		const mockInvites: PendingInvite[] = [inviteToCancel];

		mockGetPendingInvites.mockResolvedValue({ invites: mockInvites });
		mockCancelInviteAction.mockRejectedValue(new Error('Database error'));
		await loadHook();

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
		// Invite should be restored
		expect(result.current.invites).toHaveLength(1);
		expect(result.current.invites[0]).toEqual(inviteToCancel);
	});

	it('handles cancel for non-existent invite (no restore needed)', async () => {
		const mockInvites: PendingInvite[] = [
			{
				id: '1',
				email: 'user1@example.com',
				accessLevel: 'write' as AccessLevel,
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
		];

		mockGetPendingInvites.mockResolvedValue({ invites: mockInvites });
		mockCancelInviteAction.mockResolvedValue({
			success: false,
			error: 'Invite not found',
		});
		await loadHook();

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.invites).toHaveLength(1);
		});

		// Try to cancel an invite that doesn't exist (already removed or invalid id)
		const success = await result.current.cancelInvite('non-existent-id');

		expect(success).toBe(false);
		await waitFor(() => {
			expect(result.current.cancelStatus).toBe('error');
		});
		// Original invites remain unchanged since inviteToCancel was undefined
		expect(result.current.invites).toHaveLength(1);
		expect(result.current.invites[0].id).toBe('1');
	});

	it('handles exception when canceling non-existent invite (no restore needed)', async () => {
		const mockInvites: PendingInvite[] = [
			{
				id: '1',
				email: 'user1@example.com',
				accessLevel: 'write' as AccessLevel,
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
		];

		mockGetPendingInvites.mockResolvedValue({ invites: mockInvites });
		mockCancelInviteAction.mockRejectedValue(new Error('Server error'));
		await loadHook();

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.invites).toHaveLength(1);
		});

		// Try to cancel an invite that doesn't exist
		const success = await result.current.cancelInvite('non-existent-id');

		expect(success).toBe(false);
		await waitFor(() => {
			expect(result.current.cancelStatus).toBe('error');
		});
		// Original invites remain unchanged since inviteToCancel was undefined
		expect(result.current.invites).toHaveLength(1);
		expect(result.current.invites[0].id).toBe('1');
	});

	it('refetches when plannerId changes', async () => {
		const mockInvites: PendingInvite[] = [
			{
				id: '1',
				email: 'user1@example.com',
				accessLevel: 'write' as AccessLevel,
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
		];

		mockGetPendingInvites.mockResolvedValue({ invites: mockInvites });
		await loadHook();

		const { result, rerender } = renderHook(
			({ id }: { id: string }) => useInvites(id),
			{ initialProps: { id: plannerId } },
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(mockGetPendingInvites).toHaveBeenCalledTimes(1);

		rerender({ id: 'different-planner-id' });

		await waitFor(() => {
			expect(mockGetPendingInvites).toHaveBeenCalledTimes(2);
		});

		expect(mockGetPendingInvites).toHaveBeenLastCalledWith(
			'different-planner-id',
		);
	});

	it('maintains independent status states for invite and cancel', async () => {
		const mockInvites: PendingInvite[] = [
			{
				id: '1',
				email: 'user1@example.com',
				accessLevel: 'write' as AccessLevel,
				invitedAt: '2024-01-01T00:00:00.000Z',
				expiresAt: '2024-01-08T00:00:00.000Z',
			},
		];

		mockGetPendingInvites.mockResolvedValue({ invites: mockInvites });
		mockCancelInviteAction.mockResolvedValue({ success: true });
		mockInviteUserAction.mockResolvedValue({ ok: true, inviteId: '2' });
		await loadHook();

		const { result } = renderHook(() => useInvites(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Cancel an invite
		await result.current.cancelInvite('1');

		await waitFor(() => {
			expect(result.current.cancelStatus).toBe('success');
		});
		expect(result.current.inviteStatus).toBe('idle');
	});
});
