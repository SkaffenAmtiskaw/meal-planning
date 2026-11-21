import { useContext } from 'react';

import { CalendarDaysContext } from './CalendarDaysContext';

export const useCalendarDays = () => {
	const calendar = useContext(CalendarDaysContext);
	if (!calendar) {
		throw new Error('useCalendarDays must be used inside CalendarDaysProvider');
	}

	return calendar;
};
