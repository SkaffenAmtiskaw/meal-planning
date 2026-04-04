import 'temporal-polyfill/global';

import { resolveDishSource } from './resolveDishSource';

export type SerializedDish = {
	name: string;
	source?: string | { url: string } | { ref: string } | { _id: string };
	note?: string;
};

type SerializedMeal = {
	_id: string;
	name: string;
	description?: string;
	dishes: SerializedDish[];
};

export type SerializedDay = {
	date: string;
	meals?: SerializedMeal[];
};

export type MealEvent = {
	id: string;
	start: Temporal.PlainDate;
	end: Temporal.PlainDate;
	title: string;
	description?: string;
	dishes: SerializedDish[];
};

export type SavedItem = { _id: string; name: string; url?: string };

export const toScheduleXEvents = (
	calendar: SerializedDay[],
	savedItems: SavedItem[] = [],
): MealEvent[] => {
	const savedMap = new Map(savedItems.map((item) => [item._id, item]));
	const events: MealEvent[] = [];
	for (const day of calendar) {
		const date = Temporal.PlainDate.from(day.date);
		for (const meal of day.meals ?? []) {
			events.push({
				id: meal._id,
				start: date,
				end: date,
				title: meal.name,
				description: meal.description,
				dishes: meal.dishes.map((dish) => resolveDishSource(dish, savedMap)),
			});
		}
	}
	return events;
};
