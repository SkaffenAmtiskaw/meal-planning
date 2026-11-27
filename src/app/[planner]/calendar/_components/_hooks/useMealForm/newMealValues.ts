import { newDishValues } from './newDishValues';
import type { MealValues } from './types';

// A new meal's values: the date it was opened with, if any, and one empty dish row.
export const newMealValues = (initialDate?: string): MealValues => ({
	date: initialDate ?? '',
	mealName: '',
	description: '',
	dishes: [newDishValues()],
});
