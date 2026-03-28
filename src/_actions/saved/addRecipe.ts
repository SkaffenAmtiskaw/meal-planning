'use server';

import { zRecipeFormSchema } from '@/_models/planner/recipe';

export const addRecipe = async (formData: FormData) => {
	const data = Object.fromEntries(formData);

	const recipe = zRecipeFormSchema.parse(data);

	/* v8 ignore next -- temporary WIP logging, not permanent behaviour */
	console.log(JSON.stringify(recipe, null, 2));
};
