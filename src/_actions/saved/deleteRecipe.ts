'use server';

import { Types } from 'mongoose';
import { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { matchesId, Planner } from '@/_models';
import type { ActionResult } from '@/_utils/actionResult';

const zDeleteRecipeSchema = z.object({
	plannerId: z.string(),
	recipeId: z.string(),
});

export const deleteRecipe = async (data: unknown): Promise<ActionResult> => {
	const { plannerId, recipeId } = zDeleteRecipeSchema.parse(data);

	const auth = await checkAuth(new Types.ObjectId(plannerId));
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	const planner = await Planner.findById(plannerId);
	if (!planner) return { ok: false, error: 'Planner not found' };

	const index = planner.saved.findIndex(matchesId(recipeId));
	if (index === -1) return { ok: false, error: 'Recipe not found' };

	planner.saved.splice(index, 1);
	await planner.save();

	return { ok: true, data: undefined };
};
