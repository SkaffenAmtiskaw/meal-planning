import 'temporal-polyfill/global';

import type { DayInterface } from '@/_models/types';

import { type ResolvedDish, resolveDishSource } from './resolveDishSource';

import type { SavedItem } from '../_types/savedItem';

export type MealEvent = {
	id: string;
	start: Temporal.PlainDate;
	end: Temporal.PlainDate;
	title: string;
	description?: string;
	dishes: ResolvedDish[];
};

export const toScheduleXEvents = (
	calendar: DayInterface[],
	savedItems: SavedItem[] = [],
): MealEvent[] => {
	const savedMap = new Map(savedItems.map((item) => [item._id, item]));
	const events: MealEvent[] = [];
	for (const day of calendar) {
		const date = Temporal.PlainDate.from(day.date);
		for (const meal of day.meals) {
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
