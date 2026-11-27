import type { DishSource } from '@/_actions/calendar/types';

export type DishValues = {
	// Keeps a row's identity as dishes come and go. A new row gets a random one.
	key: string;
	name: string;
	// Null while nothing is linked.
	source: DishSource | null;
	note: string;
};

export type MealValues = {
	// An ISO date, or '' while the meal has no date.
	date: string;
	mealName: string;
	description: string;
	dishes: DishValues[];
};
