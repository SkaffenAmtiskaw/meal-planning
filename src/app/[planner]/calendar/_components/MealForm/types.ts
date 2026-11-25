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

/** What the form tells its frame as the user edits, so the frame can draw its header. */
export type MealFormStatus = {
	date: string;
	mealName: string;
	// True while a dish is being linked to a saved recipe, when Esc shouldn't close the frame.
	linking: boolean;
};

// The meal's own fields, which the form edits in place.
export type MealField = 'date' | 'mealName' | 'description';
