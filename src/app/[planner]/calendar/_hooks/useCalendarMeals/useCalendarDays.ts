import { useContext } from 'react';

import { CalendarDaysContext } from './CalendarDaysContext';

/**
 * The calendar days the page renders, from `CalendarDaysProvider`. The hooks
 * that build on the days read them here, so each throws the same error when
 * it's used outside the provider.
 */
export const useCalendarDays = () => {
	const calendar = useContext(CalendarDaysContext);

	if (!calendar) {
		throw new Error('useCalendarDays must be used inside CalendarDaysProvider');
	}

	return calendar;
};
