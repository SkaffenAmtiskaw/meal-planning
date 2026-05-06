import type { z } from 'zod';

import type { zRecipeFormSchema } from '@/_models/planner/recipe.types';

type RecipeFormData = z.infer<typeof zRecipeFormSchema>;

export const transformRecipeForm = <T extends RecipeFormData>(data: T): T => {
	const result = { ...data };

	// Handle source transformation
	if (result.source?.name) {
		// Name exists - keep source but clean up url (empty string -> undefined)
		result.source = {
			name: result.source.name,
			url: result.source.url || undefined,
		};
	} else if (result.source) {
		// Source exists but name is empty - remove source entirely
		delete (result as { source?: unknown }).source;
	}

	// Handle time transformation
	if (result.time) {
		const hasNonEmptyTime = Object.values(result.time).some(Boolean);
		if (hasNonEmptyTime) {
			// Some fields have values - convert empty strings to undefined
			result.time = {
				prep: result.time.prep || undefined,
				cook: result.time.cook || undefined,
				total: result.time.total || undefined,
				actual: result.time.actual || undefined,
			};
		} else {
			// All fields are empty - remove time entirely
			delete (result as { time?: unknown }).time;
		}
	}

	return result;
};
