import { useDisclosure } from '@mantine/hooks';

import { renderHook } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useEditMode } from './useEditMode';

vi.mock('@mantine/hooks', async () => await import('@mocks/@mantine/hooks'));

describe('useEditMode', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should initialize with false by default', () => {
		const { result } = renderHook(() => useEditMode());

		expect(useDisclosure).toHaveBeenCalledWith(false);
		expect(result.current[0]).toBe(false);
	});

	it('should accept an optional initial state', () => {
		const { result } = renderHook(() => useEditMode(true));

		expect(useDisclosure).toHaveBeenCalledWith(true);
		expect(result.current[0]).toBe(true);
	});

	it('should call handlers.open when enterEditing is invoked', () => {
		const mockOpen = vi.fn();
		vi.mocked(useDisclosure).mockReturnValueOnce([
			false,
			{ open: mockOpen, close: vi.fn(), toggle: vi.fn(), set: vi.fn() },
		]);

		const { result } = renderHook(() => useEditMode());
		result.current[1].enterEditing();

		expect(mockOpen).toHaveBeenCalled();
	});

	it('should call handlers.close when exitEditing is invoked', () => {
		const mockClose = vi.fn();
		vi.mocked(useDisclosure).mockReturnValueOnce([
			false,
			{ open: vi.fn(), close: mockClose, toggle: vi.fn(), set: vi.fn() },
		]);

		const { result } = renderHook(() => useEditMode());
		result.current[1].exitEditing();

		expect(mockClose).toHaveBeenCalled();
	});
});
