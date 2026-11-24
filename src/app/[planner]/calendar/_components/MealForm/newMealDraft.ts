import type { MealDraft } from './types';

import { newDishDraft } from './_utils/newDishDraft';

// A new meal's draft: the date it was opened with, if any, and one empty dish row.
export const newMealDraft = (initialDate?: string): MealDraft => ({
	date: initialDate ?? '',
	mealName: '',
	description: '',
	dishes: [newDishDraft()],
});
