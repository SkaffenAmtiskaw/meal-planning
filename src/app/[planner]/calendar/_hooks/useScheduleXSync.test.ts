import { renderHook } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { useScheduleXSync } from './useScheduleXSync';

vi.mock('../_utils/getScheduleXViewId', () => ({
	getScheduleXViewId: vi.fn((viewType: string) =>
		viewType === 'list' ? 'list' : 'month-grid',
	),
}));

describe('useScheduleXSync', () => {
	const mockSetView = vi.fn();
	const mockCalendarApp = {
		$app: {
			calendarState: { setView: mockSetView },
			datePickerState: { selectedDate: { value: '2024-01-01' } },
		},
	};

	afterEach(() => {
		mockSetView.mockClear();
	});

	test('calls setView with month-grid for month view on desktop', () => {
		renderHook(() => useScheduleXSync(mockCalendarApp, 'month', false));
		expect(mockSetView).toHaveBeenCalledWith('month-grid', '2024-01-01');
	});

	test('calls setView with list for list view', () => {
		renderHook(() => useScheduleXSync(mockCalendarApp, 'list', false));
		expect(mockSetView).toHaveBeenCalledWith('list', '2024-01-01');
	});

	test('does not call setView when viewType is week', () => {
		renderHook(() => useScheduleXSync(mockCalendarApp, 'week', false));
		expect(mockSetView).not.toHaveBeenCalled();
	});

	test('handles missing $app gracefully', () => {
		renderHook(() => useScheduleXSync({}, 'month', false));
		expect(mockSetView).not.toHaveBeenCalled();
	});

	test('handles missing calendarState gracefully', () => {
		renderHook(() => useScheduleXSync({ $app: {} }, 'month', false));
		expect(mockSetView).not.toHaveBeenCalled();
	});
});
