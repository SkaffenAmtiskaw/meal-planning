'use client';

import { createContext, useContext } from 'react';

import type {
	CalendarModalData,
	CalendarModalState,
	CalendarModalType,
} from './CalendarModalContext.types';

export interface CalendarModalContextValue {
	state: CalendarModalState;
	open: <T extends CalendarModalType>(
		type: T,
		data: CalendarModalData[T],
	) => void;
	close: () => void;
}

export const CalendarModalContext =
	createContext<CalendarModalContextValue | null>(null);

/**
 * Hook to access the calendar modal context value.
 * Must be used within a CalendarModalProvider.
 * @throws Error if used outside of CalendarModalProvider
 */
export const useCalendarModal = (): CalendarModalContextValue => {
	const context = useContext(CalendarModalContext);

	if (context === null) {
		throw new Error(
			'useCalendarModal must be used within a CalendarModalProvider',
		);
	}

	return context;
};
