import type { MealDraft } from '../types';

// Date and Meal name are required, so a save waits until both are filled.
export const canSubmitMeal = ({ date, mealName }: MealDraft): boolean =>
	date !== '' && mealName.trim() !== '';
