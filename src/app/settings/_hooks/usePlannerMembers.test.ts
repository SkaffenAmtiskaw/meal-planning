import { renderHook, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PlannerMember } from '@/_actions/planner/getPlannerMembers.types';

import { usePlannerMembers } from './usePlannerMembers';

const mockGetPlannerMembers = vi.fn();

vi.mock('@/_actions/planner/getPlannerMembers', () => ({
	getPlannerMembers: (...args: unknown[]) => mockGetPlannerMembers(...args),
}));

describe('usePlannerMembers', () => {
	const plannerId = '507f1f77bcf86cd799439011';

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('returns initial loading state', () => {
		mockGetPlannerMembers.mockImplementation(() => new Promise(() => {}));

		const { result } = renderHook(() => usePlannerMembers(plannerId));

		expect(result.current.loading).toBe(true);
		expect(result.current.error).toBeNull();
		expect(result.current.members).toEqual([]);
	});

	it('fetches and returns members successfully', async () => {
		const mockMembers: PlannerMember[] = [
			{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
			{ name: 'Bob', email: 'bob@example.com', accessLevel: 'write' },
		];

		mockGetPlannerMembers.mockResolvedValue({ members: mockMembers });

		const { result } = renderHook(() => usePlannerMembers(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.members).toEqual(mockMembers);
		expect(result.current.error).toBeNull();
	});

	it('handles error from getPlannerMembers', async () => {
		mockGetPlannerMembers.mockResolvedValue({
			members: [],
			error: 'Unauthorized',
		});

		const { result } = renderHook(() => usePlannerMembers(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe('Unauthorized');
		expect(result.current.members).toEqual([]);
	});

	it('handles unexpected errors', async () => {
		mockGetPlannerMembers.mockRejectedValue(new Error('Network error'));

		const { result } = renderHook(() => usePlannerMembers(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe('Failed to load members');
		expect(result.current.members).toEqual([]);
	});

	it('refresh function refetches members', async () => {
		const initialMembers: PlannerMember[] = [
			{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
		];
		const updatedMembers: PlannerMember[] = [
			{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
			{ name: 'Bob', email: 'bob@example.com', accessLevel: 'write' },
		];

		mockGetPlannerMembers
			.mockResolvedValueOnce({ members: initialMembers })
			.mockResolvedValueOnce({ members: updatedMembers });

		const { result } = renderHook(() => usePlannerMembers(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.members).toEqual(initialMembers);

		// Call refresh
		await result.current.refresh();

		await waitFor(() => {
			expect(result.current.members).toEqual(updatedMembers);
		});

		expect(mockGetPlannerMembers).toHaveBeenCalledTimes(2);
	});

	it('refresh handles errors', async () => {
		const initialMembers: PlannerMember[] = [
			{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
		];

		mockGetPlannerMembers
			.mockResolvedValueOnce({ members: initialMembers })
			.mockResolvedValueOnce({ members: [], error: 'Refresh failed' });

		const { result } = renderHook(() => usePlannerMembers(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.members).toEqual(initialMembers);

		// Call refresh - should not update members on error
		await result.current.refresh();

		expect(mockGetPlannerMembers).toHaveBeenCalledTimes(2);
		// Members should remain unchanged on refresh error
		expect(result.current.members).toEqual(initialMembers);
	});

	it('refetches when plannerId changes', async () => {
		const mockMembers: PlannerMember[] = [
			{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
		];

		mockGetPlannerMembers.mockResolvedValue({ members: mockMembers });

		const { result, rerender } = renderHook(
			({ id }: { id: string }) => usePlannerMembers(id),
			{ initialProps: { id: plannerId } },
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(mockGetPlannerMembers).toHaveBeenCalledTimes(1);

		// Change plannerId
		rerender({ id: 'different-planner-id' });

		await waitFor(() => {
			expect(mockGetPlannerMembers).toHaveBeenCalledTimes(2);
		});

		expect(mockGetPlannerMembers).toHaveBeenLastCalledWith(
			'different-planner-id',
		);
	});
});
