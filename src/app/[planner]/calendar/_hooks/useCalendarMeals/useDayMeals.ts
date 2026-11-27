import { useMemo } from 'react';

import type { DateTime } from 'luxon';

import { useCalendarDays } from './useCalendarDays';

import { usePlannerSavedItems } from '../usePlannerSavedItems';
import type { CalendarMeal } from '../../_components/Calendar';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';

const NO_MEALS: CalendarMeal[] = [];

/**
 * One day's meals, built the same way as `useCalendarMeals`. Each list's day
 * reads its own meals here, so a list builds only the days it draws.
 */
export const useDayMeals = (date: DateTime): CalendarMeal[] => {
	const calendar = useCalendarDays();
	const savedItems = usePlannerSavedItems();
	const isoDate = date.toISODate();

	return useMemo(() => {
		const day = calendar.find((entry) => entry.date === isoDate);
		return day ? toCalendarMeals([day], savedItems) : NO_MEALS;
	}, [calendar, savedItems, isoDate]);
};
