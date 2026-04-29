import { useContext } from 'react';

import { DateTime } from 'luxon';
import { describe, expect, it, vi } from 'vitest';

import { useCalendarContext } from './CalendarContext';
import type { CalendarContextValue, CalendarViewType } from './CalendarContext';

// Mock React's createContext and useContext
vi.mock('react', async () => {
	const actual = await vi.importActual('react');
	return {
		...actual,
		createContext: vi.fn(),
		useContext: vi.fn(),
	};
});

describe('CalendarContext', () => {
	describe('useCalendarContext', () => {
		it('should throw error when used outside provider', () => {
			// Mock useContext to return undefined (simulating usage outside provider)
			vi.mocked(useContext).mockReturnValue(undefined);

			expect(() => {
				useCalendarContext();
			}).toThrow('useCalendarContext must be used within a CalendarProvider');
		});

		it('should return context value when inside provider', () => {
			const mockContextValue: CalendarContextValue = {
				selectedDate: DateTime.now(),
				viewType: 'month',
				setSelectedDate: vi.fn(),
				setViewType: vi.fn(),
				goToToday: vi.fn(),
				goToPrevious: vi.fn(),
				goToNext: vi.fn(),
			};

			// Mock useContext to return the mock context value
			vi.mocked(useContext).mockReturnValue(mockContextValue);

			const result = useCalendarContext();

			expect(result).toBe(mockContextValue);
		});
	});

	describe('CalendarViewType', () => {
		it('should accept month view type', () => {
			const viewType: CalendarViewType = 'month';
			expect(viewType).toBe('month');
		});

		it('should accept week view type', () => {
			const viewType: CalendarViewType = 'week';
			expect(viewType).toBe('week');
		});

		it('should accept list view type', () => {
			const viewType: CalendarViewType = 'list';
			expect(viewType).toBe('list');
		});
	});
});
