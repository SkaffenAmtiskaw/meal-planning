import { z } from 'zod';

import { zId } from '@/_utils/zId';
import { zOptionalNonEmptyString } from '@/_utils/zOptionalNonEmptyString';

// A dish links a saved recipe or bookmark by its id, or a reference by its text. A dish with neither has no source.
export const zDishSource = z.discriminatedUnion('kind', [
	z.object({ kind: z.literal('saved'), savedId: zId }),
	z.object({ kind: z.literal('reference'), text: z.string().min(1) }),
]);

const zDishInput = z.object({
	name: z.string().min(1, { error: 'Dish name is required' }),
	source: zDishSource.optional(),
	note: zOptionalNonEmptyString,
});

// A meal as a form sends it, before the planner it goes in is added.
export const zMealInput = z.object({
	date: z.iso.date(),
	mealName: z.string().min(1, { error: 'Meal name is required' }),
	description: zOptionalNonEmptyString,
	dishes: z.array(zDishInput),
});

export const zAddMealInput = zMealInput.extend({ plannerId: z.string() });
