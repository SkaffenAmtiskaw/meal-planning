'use server';

import { zRecipeFormSchema } from '@/_models/planner/recipe';

export const addRecipe = async (formData: FormData) => {
	const data = Object.fromEntries(formData);

	const recipe = zRecipeFormSchema.parse(data);

	console.log(JSON.stringify(recipe, null, 2));
};
