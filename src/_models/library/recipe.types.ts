import { z } from 'zod';

import { zId } from '@/_utils/zId';
import { zOptionalNonEmptyString } from '@/_utils/zOptionalNonEmptyString';

export const zRecipeInterface = z.object({
	_id: zId,
	ingredients: z.array(z.string()),
	instructions: z.array(z.string()),
	name: z.string().min(1, { error: 'Name is required' }),
	notes: zOptionalNonEmptyString,
	servings: z.number().optional(),
	source: z
		.object({
			name: z.string(),
			url: z.url().optional(),
		})
		.optional(),
	storage: zOptionalNonEmptyString,
	tags: z.array(zId).optional(),
	time: z
		.object({
			prep: zOptionalNonEmptyString,
			cook: zOptionalNonEmptyString,
			total: zOptionalNonEmptyString,
			actual: zOptionalNonEmptyString,
		})
		.optional(),
});

// The form starts its optional fields at '', and the action leaves them out before it writes.
export const zRecipeFormSchema = zRecipeInterface.omit({ _id: true }).extend({
	plannerId: z.string(),
	notes: z.string().optional(),
	storage: z.string().optional(),
	source: z
		.object({
			name: z.string(),
			url: z.union([z.url(), z.literal('')]).optional(),
		})
		.optional(),
	time: z
		.object({
			prep: z.string().optional(),
			cook: z.string().optional(),
			total: z.string().optional(),
			actual: z.string().optional(),
		})
		.optional(),
});

export type RecipeInterface = z.infer<typeof zRecipeInterface>;
