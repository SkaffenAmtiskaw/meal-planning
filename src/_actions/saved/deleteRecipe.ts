'use server';

import { Types } from 'mongoose';
import { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { matchesId, Planner } from '@/_models';

const zDeleteRecipeSchema = z.object({
	plannerId: z.string(),
	recipeId: z.string(),
});

export const deleteRecipe = async (data: unknown): Promise<void> => {
	const { plannerId, recipeId } = zDeleteRecipeSchema.parse(data);

	const auth = await checkAuth(new Types.ObjectId(plannerId));
	if (auth.type !== 'authorized') throw new Error('Unauthorized');

	const planner = await Planner.findById(plannerId);
	if (!planner) throw new Error('Planner not found');

	const index = planner.saved.findIndex(matchesId(recipeId));
	if (index === -1) throw new Error('Recipe not found');

	planner.saved.splice(index, 1);
	await planner.save();
};
