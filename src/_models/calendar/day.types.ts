import { z } from 'zod';

import { zId } from '@/_utils/zId';
import { zOptionalNonEmptyString } from '@/_utils/zOptionalNonEmptyString';

export const zDishFormInput = z.object({
	name: z.string().min(1, { error: 'Dish name is required' }),
	sourceType: z.enum(['none', 'saved', 'text']),
	savedId: zId.optional(),
	sourceText: z.string().optional(),
	note: z.string().optional(),
});

export const zMealFormSchema = z.object({
	plannerId: z.string(),
	date: z.iso.date(),
	mealName: z.string().min(1, { error: 'Meal name is required' }),
	description: z.string().optional(),
	dishes: z.array(zDishFormInput),
});

export type MealFormData = z.infer<typeof zMealFormSchema>;

const zDishInterface = z.object({
	_id: zId,
	name: z.string(),
	// A bare string is always a saved item's id; free text is `{ ref }`.
	source: z
		.union([zId, z.object({ url: z.url() }), z.object({ ref: z.string() })])
		.optional(),
	note: zOptionalNonEmptyString,
});

const zMealInterface = z.object({
	_id: zId,
	name: z.string(),
	description: zOptionalNonEmptyString,
	dishes: z.array(zDishInterface),
});

export const zDayInterface = z.object({
	date: z.iso.date(),
	meals: z.array(zMealInterface),
});

export type DishInterface = z.infer<typeof zDishInterface>;
export type MealInterface = z.infer<typeof zMealInterface>;
export type DayInterface = z.infer<typeof zDayInterface>;
