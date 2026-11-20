'use server';

import { plannerCache } from '@/_actions/_utils/caches';
import { defineMutation } from '@/_actions/_utils/defineMutation';
import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';
import type { RecipeInterface } from '@/_models/library';
import { zRecipeFormSchema } from '@/_models/library';

import { transformRecipeForm } from './_utils/transformRecipeForm';

export const addRecipe = defineMutation({
	schema: zRecipeFormSchema,
	access: { planner: (input) => input.plannerId, level: 'write' },
	invalidates: (input) => [plannerCache.saved(input.plannerId)],
	handler: async (input) => {
		const { plannerId, ...recipeFields } = transformRecipeForm(input);

		const recipe: RecipeInterface = { _id: newId(), ...recipeFields };
		const result = await planners.updateOne(
			{ _id: plannerId },
			{ $push: { saved: recipe } },
		);
		if (result.matchedCount === 0)
			return { ok: false, error: 'Planner not found' };

		return { ok: true, data: { _id: recipe._id, name: recipe.name } };
	},
});
