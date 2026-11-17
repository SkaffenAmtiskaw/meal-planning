import 'temporal-polyfill/global';

import type {
	BookmarkInterface,
	DayInterface,
	DishInterface,
	RecipeInterface,
} from '@/_models/types';

import { resolveDishSource } from './resolveDishSource';

/** A dish to show, with a saved-item source resolved to the item's url, or to its `_id` when it has none. */
export type ResolvedDish = Omit<DishInterface, '_id' | 'source'> & {
	source?: DishInterface['source'] | { _id: string };
};

export type MealEvent = {
	id: string;
	start: Temporal.PlainDate;
	end: Temporal.PlainDate;
	title: string;
	description?: string;
	dishes: ResolvedDish[];
};

/** The parts of a planner's saved item that the calendar reads. */
export type SavedItem =
	| Pick<BookmarkInterface, '_id' | 'name' | 'url'>
	| Pick<RecipeInterface, '_id' | 'name'>;

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
