import { z } from 'zod';

import { zRecipeInterface } from '@/_models/library';

// Only the fields the form edits, so a field the server sets never comes from the browser.
// The form starts its optional fields at '', and the action leaves them out before it writes.
export const zRecipeInput = zRecipeInterface
	.pick({
		ingredients: true,
		instructions: true,
		name: true,
		servings: true,
		tags: true,
	})
	.extend({
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
