import type { Model } from 'mongoose';
import { model, models, Schema } from 'mongoose';
import { z } from 'zod';
import { recipeSchema, zRecipeInterface } from './recipe';
import { tagSchema, zTagInterface } from './tag';

export const zMealsInterface = z.object({
	recipes: z.array(zRecipeInterface).optional(),
	tags: z.array(zTagInterface).optional(),
});

type MealsInterface = z.infer<typeof zMealsInterface>;

const mealsSchema = new Schema<MealsInterface>({
	recipes: [recipeSchema],
	tags: [tagSchema],
});

export const Meals: Model<MealsInterface> =
	models.Meals || model<MealsInterface>('Meals', mealsSchema);
