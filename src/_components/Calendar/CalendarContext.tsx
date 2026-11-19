'use client';

import { createContext, useContext } from 'react';

import type { CalendarContextValue } from './types';

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
