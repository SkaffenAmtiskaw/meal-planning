import { useContext, useMemo } from 'react';

import { CalendarDaysContext } from './CalendarDaysContext';

import { usePlannerSavedItems } from '../usePlannerSavedItems';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';

/**
 * The calendar's meals, built from the days the page renders, with each dish
 * resolved through the planner's saved items. The views and the meal detail
 * modal all read them here, so they all see the same meals.
 */
export const useCalendarMeals = () => {
	const calendar = useContext(CalendarDaysContext);
	const savedItems = usePlannerSavedItems();

	const meals = useMemo(
		() => (calendar ? toCalendarMeals(calendar, savedItems) : null),
		[calendar, savedItems],
	);

	if (!meals) {
		throw new Error(
			'useCalendarMeals must be used inside CalendarDaysProvider',
		);
	}

	return meals;
};
