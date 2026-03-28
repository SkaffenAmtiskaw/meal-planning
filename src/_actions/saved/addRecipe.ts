'use server';

import { Types } from 'mongoose';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';
import type { RecipeInterface } from '@/_models/planner/recipe.types';
import { zRecipeFormSchema } from '@/_models/planner/recipe.types';

export const addRecipe = async (
	data: unknown,
): Promise<{ _id: string; name: string }> => {
	const { plannerId, ...recipeFields } = zRecipeFormSchema.parse(data);

	const auth = await checkAuth(new Types.ObjectId(plannerId));
	if (auth.type !== 'authorized') throw new Error('Unauthorized');

	const planner = await Planner.findById(plannerId);
	if (!planner) throw new Error('Planner not found');

	planner.saved.push(recipeFields as unknown as RecipeInterface);
	await planner.save();

	const recipe = planner.saved[planner.saved.length - 1] as RecipeInterface & {
		_id: Types.ObjectId;
	};
	return { _id: recipe._id.toString(), name: recipe.name };
};
