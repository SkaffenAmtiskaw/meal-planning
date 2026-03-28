import { z } from 'zod';

import { zObjectId } from '../_utils/zObjectId';

export const zRecipeInterface = z.object({
	_id: zObjectId,
	ingredients: z.array(z.string()),
	instructions: z.array(z.string()),
	name: z.string(),
	notes: z.string().optional(),
	servings: z.number().optional(),
	source: z
		.object({
			name: z.string(),
			url: z.url().optional(),
		})
		.optional(),
	storage: z.string().optional(),
	tags: z.array(zObjectId).optional(),
	time: z
		.object({
			prep: z.string().optional(),
			cook: z.string().optional(),
			total: z.string().optional(),
			actual: z.string().optional(),
		})
		.optional(),
});

export const zRecipeFormSchema = zRecipeInterface.omit({ _id: true }).extend({
	plannerId: z.string(),
});

export type RecipeInterface = z.infer<typeof zRecipeInterface>;
