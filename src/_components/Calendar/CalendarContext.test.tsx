import { render } from '@testing-library/react';

import { DateTime } from 'luxon';
import { describe, expect, it, vi } from 'vitest';

import { CalendarContext, useCalendarContext } from './CalendarContext';
import type { CalendarContextValue } from './CalendarContext';

describe('useCalendarContext', () => {
	it('throws when used outside provider', () => {
		const TestComponent = () => {
			useCalendarContext();
			return null;
		};

		expect(() => render(<TestComponent />)).toThrow(
			'useCalendarContext must be used within a CalendarProvider',
		);
	});

	it('returns context value when inside provider', () => {
		const mockValue: CalendarContextValue = {
			selectedDate: DateTime.local(2024, 6, 15),
			viewType: 'month',
			setSelectedDate: vi.fn(),
			setViewType: vi.fn(),
			goToToday: vi.fn(),
			goToPrevious: vi.fn(),
			goToNext: vi.fn(),
		};

		let capturedValue: CalendarContextValue | undefined;

		const TestComponent = () => {
			capturedValue = useCalendarContext();
			return null;
		};

		render(
			<CalendarContext.Provider value={mockValue}>
				<TestComponent />
			</CalendarContext.Provider>,
		);

		expect(capturedValue).toBe(mockValue);
	});
});
