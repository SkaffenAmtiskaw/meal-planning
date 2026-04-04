import 'temporal-polyfill/global';

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

type SavedItemLookup = { _id: string; name: string; url?: string };

export const toScheduleXEvents = (
	calendar: SerializedDay[],
	savedItems: SavedItemLookup[] = [],
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
				dishes: meal.dishes.map((dish) => {
					if (typeof dish.source === 'string') {
						const saved = savedMap.get(dish.source);
						if (saved) {
							return {
								...dish,
								source: saved.url ? { url: saved.url } : { _id: saved._id },
							};
						}
					}
					return dish;
				}),
			});
		}
	}
	return events;
};
