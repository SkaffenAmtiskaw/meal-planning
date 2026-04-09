import { act, renderHook } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { useWeekNavigation } from './useWeekNavigation';

const mockPrevWeekStart = { _tag: 'prev-week' };
const mockNextWeekStart = { _tag: 'next-week' };
const mockWeekStart = {
	_tag: 'week-start',
	subtract: vi.fn(() => mockPrevWeekStart),
	add: vi.fn(() => mockNextWeekStart),
};

const { mockGetWeekStart } = vi.hoisted(() => ({
	mockGetWeekStart: vi.fn(() => mockWeekStart),
}));

vi.mock('../_utils/getWeekStart', () => ({
	getWeekStart: mockGetWeekStart,
}));

describe('useWeekNavigation', () => {
	test('initializes currentWeekStart from getWeekStart with initialDate', () => {
		const { result } = renderHook(() => useWeekNavigation('2024-01-01'));
		expect(mockGetWeekStart).toHaveBeenCalledWith('2024-01-01');
		expect(result.current.currentWeekStart).toBe(mockWeekStart);
	});

	test('initializes currentWeekStart from getWeekStart with no argument', () => {
		renderHook(() => useWeekNavigation());
		expect(mockGetWeekStart).toHaveBeenCalledWith(undefined);
	});

	test('handlePrevWeek subtracts 7 days from currentWeekStart', () => {
		const { result } = renderHook(() => useWeekNavigation());
		act(() => result.current.handlePrevWeek());
		expect(mockWeekStart.subtract).toHaveBeenCalledWith({ days: 7 });
		expect(result.current.currentWeekStart).toBe(mockPrevWeekStart);
	});

	test('handleNextWeek adds 7 days to currentWeekStart', () => {
		const { result } = renderHook(() => useWeekNavigation());
		act(() => result.current.handleNextWeek());
		expect(mockWeekStart.add).toHaveBeenCalledWith({ days: 7 });
		expect(result.current.currentWeekStart).toBe(mockNextWeekStart);
	});

	test('handleToday resets to the current week via getWeekStart(undefined)', () => {
		const mockTodayStart = { _tag: 'today' };
		mockGetWeekStart.mockReturnValueOnce(mockWeekStart as never); // initial
		mockGetWeekStart.mockReturnValueOnce(mockTodayStart as never); // handleToday
		const { result } = renderHook(() => useWeekNavigation('2024-01-01'));
		act(() => result.current.handleNextWeek());
		act(() => result.current.handleToday());
		expect(mockGetWeekStart).toHaveBeenCalledWith(undefined);
		expect(result.current.currentWeekStart).toBe(mockTodayStart);
	});
});
