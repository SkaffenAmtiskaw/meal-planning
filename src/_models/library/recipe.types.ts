import { z } from 'zod';

import { zId } from '@/_utils/zId';
import { zOptionalNonEmptyString } from '@/_utils/zOptionalNonEmptyString';

export const zRecipeInterface = z.object({
	_id: zId,
	ingredients: z.array(z.string()),
	instructions: z.array(z.string()),
	// Set by the server when a saved meal links the recipe; left out until then.
	lastUsedAt: z.date().optional(),
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

export type RecipeInterface = z.infer<typeof zRecipeInterface>;
