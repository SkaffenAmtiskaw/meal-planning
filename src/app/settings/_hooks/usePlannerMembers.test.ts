import { renderHook, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PlannerMember } from '@/_actions/sharing';
import { getPlannerMembers } from '@/_actions/sharing';

import { usePlannerMembers } from './usePlannerMembers';

vi.mock(
	'@/_actions/sharing',
	async () => await import('@mocks/@/_actions/sharing'),
);

describe('usePlannerMembers', () => {
	const plannerId = '507f1f77bcf86cd799439011';

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('returns initial loading state', () => {
		vi.mocked(getPlannerMembers).mockImplementation(
			() => new Promise(() => {}),
		);

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

		vi.mocked(getPlannerMembers).mockResolvedValue({ members: mockMembers });

		const { result } = renderHook(() => usePlannerMembers(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.members).toEqual(mockMembers);
		expect(result.current.error).toBeNull();
	});

	it('handles error from getPlannerMembers', async () => {
		vi.mocked(getPlannerMembers).mockResolvedValue({
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
		vi.mocked(getPlannerMembers).mockRejectedValue(new Error('Network error'));

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

		vi.mocked(getPlannerMembers)
			.mockResolvedValueOnce({ members: initialMembers })
			.mockResolvedValueOnce({ members: updatedMembers });

		const { result } = renderHook(() => usePlannerMembers(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.members).toEqual(initialMembers);

		await result.current.refresh();

		await waitFor(() => {
			expect(result.current.members).toEqual(updatedMembers);
		});

		expect(getPlannerMembers).toHaveBeenCalledTimes(2);
	});

	it('refresh handles errors', async () => {
		const initialMembers: PlannerMember[] = [
			{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
		];

		vi.mocked(getPlannerMembers)
			.mockResolvedValueOnce({ members: initialMembers })
			.mockResolvedValueOnce({ members: [], error: 'Refresh failed' });

		const { result } = renderHook(() => usePlannerMembers(plannerId));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.members).toEqual(initialMembers);

		await result.current.refresh();

		expect(getPlannerMembers).toHaveBeenCalledTimes(2);
		expect(result.current.members).toEqual(initialMembers);
	});

	it('refetches when plannerId changes', async () => {
		const mockMembers: PlannerMember[] = [
			{ name: 'Alice', email: 'alice@example.com', accessLevel: 'owner' },
		];

		vi.mocked(getPlannerMembers).mockResolvedValue({ members: mockMembers });

		const { result, rerender } = renderHook(
			({ id }: { id: string }) => usePlannerMembers(id),
			{ initialProps: { id: plannerId } },
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(getPlannerMembers).toHaveBeenCalledTimes(1);

		rerender({ id: 'different-planner-id' });

		await waitFor(() => {
			expect(getPlannerMembers).toHaveBeenCalledTimes(2);
		});

		expect(getPlannerMembers).toHaveBeenLastCalledWith('different-planner-id');
	});
});
