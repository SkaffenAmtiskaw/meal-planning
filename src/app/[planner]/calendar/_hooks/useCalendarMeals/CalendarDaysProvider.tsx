'use client';

import type { ReactNode } from 'react';

import type { DayInterface } from '@/_models/types';

import { CalendarDaysContext } from './CalendarDaysContext';

type Props = {
	calendar: DayInterface[];
	children: ReactNode;
};

/**
 * Passes the calendar days the page renders on the server down to the
 * calendar's modals, which find their record in them by id. When the server
 * re-renders the page after a save, this passes the new days on, so an open
 * modal shows the change.
 */
export const CalendarDaysProvider = ({ calendar, children }: Props) => (
	<CalendarDaysContext.Provider value={calendar}>
		{children}
	</CalendarDaysContext.Provider>
);
