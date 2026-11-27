import { zRequiredMealFields } from './mealValues';
import type { MealValues } from './types';

// Whether the save button can be pressed: Date and Meal name are filled.
export const hasRequiredFields = (values: MealValues): boolean =>
	zRequiredMealFields.safeParse(values).success;
