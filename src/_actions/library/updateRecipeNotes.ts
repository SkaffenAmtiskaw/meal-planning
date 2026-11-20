'use server';

import { z } from 'zod';

import { plannerCache } from '@/_actions/_utils/caches';
import { defineMutation } from '@/_actions/_utils/defineMutation';
import { planners } from '@/_models/database/planners';

const zUpdateRecipeNotesSchema = z.object({
	plannerId: z.string(),
	recipeId: z.string(),
	notes: z.string(),
});

export const updateRecipeNotes = defineMutation({
	schema: zUpdateRecipeNotesSchema,
	access: { planner: (input) => input.plannerId, level: 'write' },
	invalidates: (input) => [plannerCache.saved(input.plannerId)],
	handler: async ({ plannerId, recipeId, notes }) => {
		const result = await planners.updateOne(
			{ _id: plannerId, 'saved._id': recipeId },
			notes
				? { $set: { 'saved.$.notes': notes } }
				: { $unset: { 'saved.$.notes': '' } },
		);

		if (result.matchedCount === 0)
			return { ok: false, error: 'Recipe not found' };

		return { ok: true, data: undefined };
	},
});
