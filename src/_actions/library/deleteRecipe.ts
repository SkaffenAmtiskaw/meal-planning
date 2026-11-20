'use server';

import { z } from 'zod';

import { plannerCache } from '@/_actions/_utils/caches';
import { defineMutation } from '@/_actions/_utils/defineMutation';
import { planners } from '@/_models/database/planners';

const zDeleteRecipeSchema = z.object({
	plannerId: z.string(),
	recipeId: z.string(),
});

export const deleteRecipe = defineMutation({
	schema: zDeleteRecipeSchema,
	access: { planner: (input) => input.plannerId, level: 'write' },
	invalidates: (input) => [plannerCache.saved(input.plannerId)],
	handler: async ({ plannerId, recipeId }) => {
		const result = await planners.updateOne(
			{ _id: plannerId, 'saved._id': recipeId },
			{ $pull: { saved: { _id: recipeId } } },
		);
		if (result.matchedCount === 0)
			return { ok: false, error: 'Recipe not found' };

		return { ok: true, data: undefined };
	},
});
