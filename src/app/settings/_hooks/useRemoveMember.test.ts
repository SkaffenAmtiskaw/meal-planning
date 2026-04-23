import { renderHook, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRemoveMember } from './useRemoveMember';

const mockRemoveMember = vi.fn();

vi.mock('@/_actions/planner/removeMember', () => ({
	removeMember: (...args: unknown[]) => mockRemoveMember(...args),
}));

describe('useRemoveMember', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const memberEmail = 'member@example.com';

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('returns initial state with isLoading false and no error', () => {
		const { result } = renderHook(() =>
			useRemoveMember(plannerId, memberEmail),
		);

		expect(result.current.isLoading).toBe(false);
		expect(result.current.error).toBeNull();
	});

	it('returns true when removal is successful', async () => {
		mockRemoveMember.mockResolvedValue({ ok: true });

		const { result } = renderHook(() =>
			useRemoveMember(plannerId, memberEmail),
		);

		const success = await result.current.remove();

		expect(success).toBe(true);
		expect(mockRemoveMember).toHaveBeenCalledWith(plannerId, memberEmail);
	});

	it('sets isLoading to true while removing', async () => {
		mockRemoveMember.mockImplementation(
			() =>
				new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 50)),
		);

		const { result } = renderHook(() =>
			useRemoveMember(plannerId, memberEmail),
		);

		// Start the removal
		const removePromise = result.current.remove();

		// Should be loading after state updates
		await waitFor(() => {
			expect(result.current.isLoading).toBe(true);
		});

		// Wait for completion
		await removePromise;

		// Should not be loading after completion
		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});
	});

	it('returns false and sets error when removal fails with error message', async () => {
		mockRemoveMember.mockResolvedValue({
			ok: false,
			error: 'Cannot remove owner',
		});

		const { result } = renderHook(() =>
			useRemoveMember(plannerId, memberEmail),
		);

		const success = await result.current.remove();

		expect(success).toBe(false);
		await waitFor(() => {
			expect(result.current.error).toBe('Cannot remove owner');
		});
	});

	it('returns false and sets default error when removal fails without error message', async () => {
		mockRemoveMember.mockResolvedValue({ ok: false });

		const { result } = renderHook(() =>
			useRemoveMember(plannerId, memberEmail),
		);

		const success = await result.current.remove();

		expect(success).toBe(false);
		await waitFor(() => {
			expect(result.current.error).toBe('Failed to remove member');
		});
	});

	it('returns false and sets error when an exception is thrown', async () => {
		mockRemoveMember.mockRejectedValue(new Error('Network error'));

		const { result } = renderHook(() =>
			useRemoveMember(plannerId, memberEmail),
		);

		const success = await result.current.remove();

		expect(success).toBe(false);
		await waitFor(() => {
			expect(result.current.error).toBe('An unexpected error occurred');
		});
	});

	it('resets error on new removal call', async () => {
		mockRemoveMember
			.mockResolvedValueOnce({ ok: false, error: 'First error' })
			.mockResolvedValueOnce({ ok: true });

		const { result } = renderHook(() =>
			useRemoveMember(plannerId, memberEmail),
		);

		// First call fails
		await result.current.remove();
		await waitFor(() => {
			expect(result.current.error).toBe('First error');
		});

		// Second call should reset error before starting (state updates are batched)
		const removePromise = result.current.remove();
		await waitFor(() => {
			expect(result.current.error).toBeNull();
		});

		// Complete the second call
		await removePromise;
	});
});
