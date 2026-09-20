'use client';

import { createContext, useContext } from 'react';

import type { DateTime } from 'luxon';

export type CalendarViewType = 'month' | 'week' | 'list';

export interface CalendarContextValue {
	// Selected date being viewed (single source of truth)
	selectedDate: DateTime;

	// Currently selected view type
	viewType: CalendarViewType;

	// Anchor for the fixed list-view day window; updates only on explicit navigation
	rangeAnchor: DateTime;

	// Setters
	setSelectedDate: (date: DateTime) => void;
	setViewType: (view: CalendarViewType) => void;

	// Explicit navigation: updates both selectedDate and rangeAnchor
	navigateToDate: (date: DateTime) => void;

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
