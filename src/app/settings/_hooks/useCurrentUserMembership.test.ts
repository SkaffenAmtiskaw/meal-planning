import { renderHook, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCurrentUserMembership } from './useCurrentUserMembership';

const mockGetUser = vi.fn();

vi.mock('@/_actions/user', () => ({
	getUser: (...args: unknown[]) => mockGetUser(...args),
}));

describe('useCurrentUserMembership', () => {
	const plannerId = '507f1f77bcf86cd799439011';

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('returns initial loading state', () => {
		mockGetUser.mockImplementation(() => new Promise(() => {}));

		const { result } = renderHook(() => useCurrentUserMembership(plannerId));

		expect(result.current.loading).toBe(true);
		expect(result.current.error).toBeNull();
		expect(result.current.email).toBeNull();
		expect(result.current.isOwner).toBe(false);
	});

	it('fetches user and returns email successfully', async () => {
		mockGetUser.mockResolvedValue({
			email: 'alice@example.com',
			planners: [
				{ planner: { toString: () => plannerId }, accessLevel: 'owner' },
			],
		});

		const { result } = renderHook(() => useCurrentUserMembership(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.email).toBe('alice@example.com');
		expect(result.current.error).toBeNull();
	});

	it('calculates isOwner as true when user is owner', async () => {
		mockGetUser.mockResolvedValue({
			email: 'alice@example.com',
			planners: [
				{ planner: { toString: () => plannerId }, accessLevel: 'owner' },
			],
		});

		const { result } = renderHook(() => useCurrentUserMembership(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.isOwner).toBe(true);
	});

	it('calculates isOwner as false when user is admin', async () => {
		mockGetUser.mockResolvedValue({
			email: 'alice@example.com',
			planners: [
				{ planner: { toString: () => plannerId }, accessLevel: 'admin' },
			],
		});

		const { result } = renderHook(() => useCurrentUserMembership(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.isOwner).toBe(false);
	});

	it('calculates isOwner as false when user has no membership', async () => {
		mockGetUser.mockResolvedValue({
			email: 'bob@example.com',
			planners: [
				{
					planner: { toString: () => 'other-planner-id' },
					accessLevel: 'owner',
				},
			],
		});

		const { result } = renderHook(() => useCurrentUserMembership(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.isOwner).toBe(false);
	});

	it('sets null email when user is null', async () => {
		mockGetUser.mockResolvedValue(null);

		const { result } = renderHook(() => useCurrentUserMembership(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.email).toBeNull();
		expect(result.current.isOwner).toBe(false);
	});

	it('handles unexpected errors', async () => {
		mockGetUser.mockRejectedValue(new Error('Network error'));

		const { result } = renderHook(() => useCurrentUserMembership(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe('Failed to load user data');
		expect(result.current.email).toBeNull();
		expect(result.current.isOwner).toBe(false);
	});

	it('refetches when plannerId changes', async () => {
		mockGetUser.mockResolvedValue({
			email: 'alice@example.com',
			planners: [],
		});

		const { result, rerender } = renderHook(
			({ id }: { id: string }) => useCurrentUserMembership(id),
			{ initialProps: { id: plannerId } },
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(mockGetUser).toHaveBeenCalledTimes(1);

		// Change plannerId
		rerender({ id: 'different-planner-id' });

		await waitFor(() => {
			expect(mockGetUser).toHaveBeenCalledTimes(2);
		});
	});
});
