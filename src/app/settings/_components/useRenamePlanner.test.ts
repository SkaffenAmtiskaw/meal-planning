import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { act, renderHook } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useRenamePlanner } from './useRenamePlanner';

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

const mockRefresh = vi.fn();

const mockUpdatePlannerName = vi.hoisted(() => vi.fn());

vi.mock('@/_actions/planner', () => ({
	updatePlannerName: mockUpdatePlannerName,
}));

vi.mock('@/_hooks', () => ({
	useEditMode: () => {
		const [editing, setEditing] = useState(false);
		return [
			editing,
			{
				enterEditing: () => setEditing(true),
				exitEditing: () => setEditing(false),
			},
		];
	},
}));

const defaultRouter = {
	push: vi.fn(),
	replace: vi.fn(),
	refresh: vi.fn(),
	back: vi.fn(),
	forward: vi.fn(),
	prefetch: vi.fn(),
};

beforeAll(() => {
	vi.mocked(useRouter).mockReturnValue({
		...defaultRouter,
		refresh: mockRefresh,
	});
});

const id = '507f1f77bcf86cd799439011';
const currentName = 'My Planner';

describe('useRenamePlanner', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('initializes with not editing and current name', () => {
		const { result } = renderHook(() => useRenamePlanner(id, currentName));

		expect(result.current.editing).toBe(false);
		expect(result.current.name).toBe(currentName);
		expect(result.current.error).toBeNull();
	});

	it('enterEditing sets editing to true', () => {
		const { result } = renderHook(() => useRenamePlanner(id, currentName));

		act(() => result.current.enterEditing());

		expect(result.current.editing).toBe(true);
	});

	it('cancel resets name and exits editing', () => {
		const { result } = renderHook(() => useRenamePlanner(id, currentName));

		act(() => result.current.enterEditing());
		act(() => result.current.setName('New Name'));
		act(() => result.current.cancel());

		expect(result.current.editing).toBe(false);
		expect(result.current.name).toBe(currentName);
		expect(result.current.error).toBeNull();
	});

	it('save calls updatePlannerName and refreshes on success', async () => {
		mockUpdatePlannerName.mockResolvedValue({ ok: true });
		const { result } = renderHook(() => useRenamePlanner(id, currentName));

		act(() => result.current.enterEditing());
		act(() => result.current.setName('New Name'));
		await act(() => result.current.save());

		expect(mockUpdatePlannerName).toHaveBeenCalledWith(id, 'New Name');
		expect(result.current.editing).toBe(false);
		expect(mockRefresh).toHaveBeenCalled();
	});

	it('save sets error and stays in editing when action fails', async () => {
		mockUpdatePlannerName.mockResolvedValue({
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
