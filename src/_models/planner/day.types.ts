import { z } from 'zod';

import { zObjectId } from '../utils/zObjectId';

export const zDishFormInput = z.object({
	name: z.string().min(1, 'Dish name is required'),
	sourceType: z.enum(['none', 'saved', 'url']),
	savedId: z.string().optional(),
	urlName: z.string().optional(),
	urlValue: z.string().optional(),
	note: z.string().optional(),
});

export const zMealFormSchema = z.object({
	plannerId: z.string(),
	date: z.iso.date(),
	mealName: z.string().min(1, 'Meal name is required'),
	description: z.string().optional(),
	dishes: z.array(zDishFormInput),
});

export type MealFormData = z.infer<typeof zMealFormSchema>;

const zDishInterface = z.object({
	name: z.string(),
	source: z
		.union([
			z.string(),
			z.object({
				name: z.string(),
				url: z.url(),
			}),
			zObjectId,
		])
		.optional(),
	note: z.string().optional(),
});

const zMealInterface = z.object({
	name: z.string(),
	description: z.string().optional(),
	dishes: z.array(zDishInterface),
});

export const zDayInterface = z.object({
	date: z.iso.date(),
	meals: z.array(zMealInterface).optional(),
});

export type DayInterface = z.infer<typeof zDayInterface>;
