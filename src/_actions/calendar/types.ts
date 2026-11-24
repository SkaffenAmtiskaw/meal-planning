import type { z } from 'zod';

import type { zDishSource, zMealInput } from './mealInput';

export type DishSource = z.infer<typeof zDishSource>;
export type MealInput = z.infer<typeof zMealInput>;
