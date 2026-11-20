'use server';

import { z } from 'zod';

import { plannerCache } from '@/_actions/_utils/caches';
import { defineMutation } from '@/_actions/_utils/defineMutation';
import { planners } from '@/_models/database/planners';
import { zId } from '@/_utils/zId';

const zUpdateRecipeTagsSchema = z.object({
	plannerId: z.string(),
	recipeId: z.string(),
	tags: z.array(zId),
});

export const updateRecipeTags = defineMutation({
	schema: zUpdateRecipeTagsSchema,
	access: { planner: (input) => input.plannerId, level: 'write' },
	invalidates: (input) => [plannerCache.saved(input.plannerId)],
	handler: async ({ plannerId, recipeId, tags }) => {
		const result = await planners.updateOne(
			{ _id: plannerId, 'saved._id': recipeId },
			{ $set: { 'saved.$.tags': tags } },
		);

		if (result.matchedCount === 0)
			return { ok: false, error: 'Recipe not found' };

		return { ok: true, data: undefined };
	},
});
