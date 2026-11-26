import type { DishSource } from '@/_actions/calendar/types';

export type DishDraft = {
	// Client-only, so rows keep their identity as dishes come and go.
	key: string;
	name: string;
	// Null while nothing is linked.
	source: DishSource | null;
	note: string;
};

export type MealDraft = {
	date: string;
	mealName: string;
	description: string;
	dishes: DishDraft[];
};

// The meal's own fields, which the form edits in place.
export type MealField = 'date' | 'mealName' | 'description';
