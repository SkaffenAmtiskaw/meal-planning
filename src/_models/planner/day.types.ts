import { z } from 'zod';

import { zObjectId } from '../_utils/zObjectId';

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
