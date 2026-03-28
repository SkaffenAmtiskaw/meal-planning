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

	const _id = new Types.ObjectId();
	planner.saved.push({ ...recipeFields, _id } as unknown as RecipeInterface);
	await planner.save();

	return { _id: _id.toString(), name: recipeFields.name };
};
