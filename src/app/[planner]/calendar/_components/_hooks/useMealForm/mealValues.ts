import { z } from 'zod';

import type { DishValues } from './types';

import { isBlankDish } from '../../_utils/isBlankDish';

// A dish that stops a save: something in it, but no name. Spaces count as no name.
export const isNamelessDish = (dish: DishValues): boolean =>
	dish.name.trim() === '' && !isBlankDish(dish);

// Date and Meal name, which Add Meal waits for.
export const zRequiredMealFields = z.object({
	date: z.string().min(1),
	mealName: z.string().trim().min(1),
});

/**
 * What a save checks. Add Meal stays off until the required fields are filled,
 * so only a nameless dish ever stops a save, with its error on its name.
 */
export const zMealValues = zRequiredMealFields.extend({
	dishes: z.array(
		z.custom<DishValues>().refine((dish) => !isNamelessDish(dish), {
			path: ['name'],
			error: 'Name this dish, or delete it.',
		}),
	),
});
