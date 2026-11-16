'use server';

import { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { planners } from '@/_models/database/planners';
import type { ActionResult } from '@/_utils/actionResult';

const zDeleteRecipeSchema = z.object({
	plannerId: z.string(),
	recipeId: z.string(),
});

export const deleteRecipe = async (data: unknown): Promise<ActionResult> => {
	const { plannerId, recipeId } = zDeleteRecipeSchema.parse(data);

	const auth = await checkAuth(plannerId, 'write');
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	const result = await planners.updateOne(
		{ _id: plannerId, 'saved._id': recipeId },
		{ $pull: { saved: { _id: recipeId } } },
	);
	if (result.matchedCount === 0)
		return { ok: false, error: 'Recipe not found' };

	return { ok: true, data: undefined };
};
