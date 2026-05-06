import { useRouter } from 'next/navigation';

import { act, renderHook } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { updatePlannerName } from '@/_actions/planner';

import { useRenamePlanner } from './useRenamePlanner';

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));
vi.mock(
	'@/_actions/planner',
	async () => await import('@mocks/@/_actions/planner'),
);
vi.mock('@/_hooks', async () => await import('@mocks/@/_hooks'));

describe('useRenamePlanner', () => {
	const mockRefresh = vi.fn();
	const id = '507f1f77bcf86cd799439011';
	const currentName = 'My Planner';

	beforeAll(() => {
		const defaultRouter = vi.mocked(useRouter)();
		vi.mocked(useRouter).mockReturnValue({
			...defaultRouter,
			refresh: mockRefresh,
		});
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('initializes with editing false, current name, and no error', () => {
		const { result } = renderHook(() => useRenamePlanner(id, currentName));

		expect(result.current.editing).toBe(false);
		expect(result.current.name).toBe(currentName);
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBeNull();
	});

	it('sets editing to true when enterEditing is called', () => {
		const { result } = renderHook(() => useRenamePlanner(id, currentName));

		act(() => result.current.enterEditing());

		expect(result.current.editing).toBe(true);
	});

	it('resets name and exits editing when cancel is called', () => {
		const { result } = renderHook(() => useRenamePlanner(id, currentName));

		act(() => result.current.enterEditing());
		act(() => result.current.setName('New Name'));
		act(() => result.current.cancel());

		expect(result.current.editing).toBe(false);
		expect(result.current.name).toBe(currentName);
		expect(result.current.error).toBeNull();
	});

	it('calls updatePlannerName, exits editing, and refreshes on success', async () => {
		const { result } = renderHook(() => useRenamePlanner(id, currentName));

		act(() => result.current.enterEditing());
		act(() => result.current.setName('New Name'));
		await act(() => result.current.save());

		expect(updatePlannerName).toHaveBeenCalledWith(id, 'New Name');
		expect(result.current.editing).toBe(false);
		expect(mockRefresh).toHaveBeenCalled();
	});

	it('sets error and stays in editing when save fails', async () => {
		vi.mocked(updatePlannerName).mockResolvedValueOnce({
			ok: false,
			error: 'Invalid name',
		});

		const { result } = renderHook(() => useRenamePlanner(id, currentName));

		act(() => result.current.enterEditing());
		await act(() => result.current.save());

		expect(result.current.editing).toBe(true);
		expect(result.current.error).toBe('Invalid name');
		expect(mockRefresh).not.toHaveBeenCalled();
	});
});
