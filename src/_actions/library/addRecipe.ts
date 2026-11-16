'use server';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';
import type { RecipeInterface } from '@/_models/library';
import { zRecipeFormSchema } from '@/_models/library';
import type { ActionResult } from '@/_utils/actionResult';

import { transformRecipeForm } from './_utils/transformRecipeForm';

export const addRecipe = async (
	data: unknown,
): Promise<ActionResult<{ _id: string; name: string }>> => {
	const parsed = zRecipeFormSchema.parse(data);
	const { plannerId, ...recipeFields } = transformRecipeForm(parsed);

	const auth = await checkAuth(plannerId, 'write');
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	const recipe: RecipeInterface = { _id: newId(), ...recipeFields };
	const result = await planners.updateOne(
		{ _id: plannerId },
		{ $push: { saved: recipe } },
	);
	if (result.matchedCount === 0)
		return { ok: false, error: 'Planner not found' };

	return { ok: true, data: { _id: recipe._id, name: recipe.name } };
};
