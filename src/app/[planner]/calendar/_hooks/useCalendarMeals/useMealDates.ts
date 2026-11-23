import { useMemo } from 'react';

import { useCalendarDays } from './useCalendarDays';

/**
 * The ISO dates of the calendar's days that have at least one meal, from the
 * days the page already renders. A day whose meals were all removed stays in
 * the calendar with no meals, so it's left out.
 */
export const useMealDates = (): string[] => {
	const calendar = useCalendarDays();

	return useMemo(
		() => calendar.filter((day) => day.meals.length > 0).map((day) => day.date),
		[calendar],
	);
};
