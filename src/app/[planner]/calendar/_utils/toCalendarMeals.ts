import type { CalendarMeal } from '@/_components/Calendar';
import { getMealColor, TAG_COLORS } from '@/_theme/colors';

import type { CalendarEvent } from './toCalendarEvents';

export function toCalendarMeals(events: CalendarEvent[]): CalendarMeal[] {
	return events.map((event) => ({
		id: event.id,
		date: event.start,
		name: event.title,
		description: event.description,
		borderColor: TAG_COLORS[getMealColor(event.title)].border,
		dishes: event.dishes,
	}));
}
