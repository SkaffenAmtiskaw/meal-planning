import { useState } from 'react';

import { act, renderHook } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { useRenamePlanner } from './useRenamePlanner';

const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({ refresh: mockRefresh }),
}));

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

const id = '507f1f77bcf86cd799439011';
const currentName = 'My Planner';

describe('useRenamePlanner', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	test('initializes with not editing and current name', () => {
		const { result } = renderHook(() => useRenamePlanner(id, currentName));

		expect(result.current.editing).toBe(false);
		expect(result.current.name).toBe(currentName);
		expect(result.current.error).toBeNull();
	});

	test('enterEditing sets editing to true', () => {
		const { result } = renderHook(() => useRenamePlanner(id, currentName));

		act(() => result.current.enterEditing());

		expect(result.current.editing).toBe(true);
	});

	test('cancel resets name and exits editing', () => {
		const { result } = renderHook(() => useRenamePlanner(id, currentName));

		act(() => result.current.enterEditing());
		act(() => result.current.setName('New Name'));
		act(() => result.current.cancel());

		expect(result.current.editing).toBe(false);
		expect(result.current.name).toBe(currentName);
		expect(result.current.error).toBeNull();
	});

	test('save calls updatePlannerName and refreshes on success', async () => {
		mockUpdatePlannerName.mockResolvedValue({ ok: true });
		const { result } = renderHook(() => useRenamePlanner(id, currentName));

		act(() => result.current.enterEditing());
		act(() => result.current.setName('New Name'));
		await act(() => result.current.save());

		expect(mockUpdatePlannerName).toHaveBeenCalledWith(id, 'New Name');
		expect(result.current.editing).toBe(false);
		expect(mockRefresh).toHaveBeenCalled();
	});

	test('save sets error and stays in editing when action fails', async () => {
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
