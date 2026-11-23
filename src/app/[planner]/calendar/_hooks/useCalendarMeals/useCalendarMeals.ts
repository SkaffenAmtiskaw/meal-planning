import { useMemo } from 'react';

import { useCalendarDays } from './useCalendarDays';

import { usePlannerSavedItems } from '../usePlannerSavedItems';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';

/**
 * The calendar's meals, built from the days the page renders, with each dish
 * resolved through the planner's saved items. The views and the meal detail
 * modal all read them here, so they all see the same meals.
 */
export const useCalendarMeals = () => {
	const calendar = useCalendarDays();
	const savedItems = usePlannerSavedItems();

	return useMemo(
		() => toCalendarMeals(calendar, savedItems),
		[calendar, savedItems],
	);
};
