import { resolveDishSource } from './resolveDishSource';
import type {
	SavedItem,
	SerializedDay,
	SerializedDish,
} from './toScheduleXEvents';

export interface CalendarEvent {
	id: string;
	start: string;
	end: string;
	title: string;
	description?: string;
	dishes: SerializedDish[];
}

export const toCalendarEvents = (
	calendar: SerializedDay[],
	savedItems: SavedItem[] = [],
): CalendarEvent[] => {
	const savedMap = new Map(savedItems.map((item) => [item._id, item]));
	const events: CalendarEvent[] = [];

	for (const day of calendar) {
		for (const meal of day.meals ?? []) {
			events.push({
				id: meal._id,
				start: day.date,
				end: day.date,
				title: meal.name,
				description: meal.description,
				dishes: meal.dishes.map((dish) => resolveDishSource(dish, savedMap)),
			});
		}
	}

	return events;
};
