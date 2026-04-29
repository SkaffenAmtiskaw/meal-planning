'use client';

import { createContext, useContext } from 'react';

import type { DateTime } from 'luxon';

export type CalendarViewType = 'month' | 'week' | 'list';

export interface CalendarContextValue {
	// Selected date being viewed (determines which month/week is displayed)
	selectedDate: DateTime;

	// Currently selected view type
	viewType: CalendarViewType;

	// Setters
	setSelectedDate: (date: DateTime) => void;
	setViewType: (view: CalendarViewType) => void;

	// Navigation actions
	goToToday: () => void;
	goToPrevious: () => void;
	goToNext: () => void;
}

// Context object
export const CalendarContext = createContext<CalendarContextValue | undefined>(
	undefined,
);

/**
 * Hook to access the calendar context value.
 * Must be used within a CalendarProvider.
 * @throws Error if used outside of CalendarProvider
 */
export const useCalendarContext = (): CalendarContextValue => {
	const context = useContext(CalendarContext);

	if (context === undefined) {
		throw new Error(
			'useCalendarContext must be used within a CalendarProvider',
		);
	}

	return context;
};
