'use server';

import { Types } from 'mongoose';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';
import type { RecipeInterface } from '@/_models/planner/recipe.types';
import { zRecipeFormSchema } from '@/_models/planner/recipe.types';
import type { ActionResult } from '@/_utils/actionResult';

export const addRecipe = async (
	data: unknown,
): Promise<ActionResult<{ _id: string; name: string }>> => {
	const { plannerId, ...recipeFields } = zRecipeFormSchema.parse(data);

	const auth = await checkAuth(new Types.ObjectId(plannerId));
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	const planner = await Planner.findById(plannerId);
	if (!planner) return { ok: false, error: 'Planner not found' };

	const insertIndex = planner.saved.length;
	planner.saved.push({ ...recipeFields } as unknown as RecipeInterface);
	await planner.save();

	return {
		ok: true,
		data: {
			_id: String(planner.saved[insertIndex]._id),
			name: recipeFields.name,
		},
	};
};
