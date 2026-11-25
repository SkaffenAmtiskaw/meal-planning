import type { SavedItem } from '@/_actions/library/types';
import type { DayInterface } from '@/_models/types';
import { getMealColor, TAG_COLORS } from '@/_theme/colors';

import { resolveDishSource } from './resolveDishSource';

import type { CalendarMeal } from '../_components/Calendar';

export function toCalendarMeals(
	calendar: DayInterface[],
	savedItems: SavedItem[] = [],
): CalendarMeal[] {
	const savedMap = new Map(savedItems.map((item) => [item._id, item]));

	return calendar.flatMap((day) =>
		day.meals.map((meal) => ({
			id: meal._id,
			date: day.date,
			name: meal.name,
			description: meal.description,
			borderColor: TAG_COLORS[getMealColor(meal.name)].border,
			dishes: meal.dishes.map((dish) => resolveDishSource(dish, savedMap)),
		})),
	);
}
