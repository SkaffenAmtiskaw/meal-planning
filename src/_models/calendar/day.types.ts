import { z } from 'zod';

import { zId } from '@/_utils/zId';
import { zOptionalNonEmptyString } from '@/_utils/zOptionalNonEmptyString';

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
