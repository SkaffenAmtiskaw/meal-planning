import { renderHook, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getUser } from '@/_actions/user';

import { useCurrentUserMembership } from './useCurrentUserMembership';

vi.mock('@/_actions/user', async () => await import('@mocks/@/_actions/user'));

describe('useCurrentUserMembership', () => {
	const plannerId = '507f1f77bcf86cd799439011';

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('returns initial loading state', () => {
		const { result } = renderHook(() => useCurrentUserMembership(plannerId));

		expect(result.current.loading).toBe(true);
		expect(result.current.error).toBeNull();
		expect(result.current.email).toBeNull();
		expect(result.current.isOwner).toBe(false);
	});

	it('fetches user and returns email and ownership status', async () => {
		vi.mocked(getUser).mockResolvedValue({
			email: 'alice@example.com',
			planners: [{ planner: plannerId, accessLevel: 'owner' }],
		} as never);

		const { result } = renderHook(() => useCurrentUserMembership(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.email).toBe('alice@example.com');
		expect(result.current.isOwner).toBe(true);
		expect(result.current.error).toBeNull();
	});

	it('calculates isOwner as false when user is admin', async () => {
		vi.mocked(getUser).mockResolvedValue({
			email: 'alice@example.com',
			planners: [{ planner: plannerId, accessLevel: 'admin' }],
		} as never);

		const { result } = renderHook(() => useCurrentUserMembership(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.isOwner).toBe(false);
	});

	it('calculates isOwner as false when user has no membership', async () => {
		vi.mocked(getUser).mockResolvedValue({
			email: 'bob@example.com',
			planners: [{ planner: 'other-planner-id', accessLevel: 'owner' }],
		} as never);

		const { result } = renderHook(() => useCurrentUserMembership(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.isOwner).toBe(false);
	});

	it('sets null email when user is null', async () => {
		vi.mocked(getUser).mockResolvedValue(null as never);

		const { result } = renderHook(() => useCurrentUserMembership(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.email).toBeNull();
		expect(result.current.isOwner).toBe(false);
	});

	it('handles unexpected errors', async () => {
		vi.mocked(getUser).mockRejectedValue(new Error('Network error'));

		const { result } = renderHook(() => useCurrentUserMembership(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe('Failed to load user data');
		expect(result.current.email).toBeNull();
		expect(result.current.isOwner).toBe(false);
	});

	it('refetches when plannerId changes', async () => {
		vi.mocked(getUser).mockResolvedValue({
			email: 'alice@example.com',
			planners: [],
		} as never);

		const { result, rerender } = renderHook(
			({ id }: { id: string }) => useCurrentUserMembership(id),
			{ initialProps: { id: plannerId } },
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(getUser).toHaveBeenCalledTimes(1);

		rerender({ id: 'different-planner-id' });

		await waitFor(() => {
			expect(getUser).toHaveBeenCalledTimes(2);
		});
	});
});
