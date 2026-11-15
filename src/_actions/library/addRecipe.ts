'use server';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { newId } from '@/_models/database/newId';
import type { RecipeInterface } from '@/_models/library';
import { zRecipeFormSchema } from '@/_models/library';
import { Planner } from '@/_models/planner';
import type { ActionResult } from '@/_utils/actionResult';

import { transformRecipeForm } from './_utils/transformRecipeForm';

export const addRecipe = async (
	data: unknown,
): Promise<ActionResult<{ _id: string; name: string }>> => {
	const parsed = zRecipeFormSchema.parse(data);
	const { plannerId, ...recipeFields } = transformRecipeForm(parsed);

	const auth = await checkAuth(plannerId, 'write');
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	const planner = await Planner.findById(plannerId);
	if (!planner) return { ok: false, error: 'Planner not found' };

	const recipe: RecipeInterface = { _id: newId(), ...recipeFields };
	planner.saved.push(recipe);
	await planner.save();

	return { ok: true, data: { _id: recipe._id, name: recipe.name } };
};
