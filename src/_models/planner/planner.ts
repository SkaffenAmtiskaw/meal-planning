import type { Model } from 'mongoose';
import { model, models, Schema, SchemaTypes } from 'mongoose';
import { z } from 'zod';

import { bookmarkSchema, zBookmarkInterface } from '@/_models/planner/bookmark';
import { daySchema, zDayInterface } from '@/_models/planner/day';
import { recipeSchema, zRecipeInterface } from './recipe';
import { tagSchema, zTagInterface } from './tag';

export const zPlannerInterface = z.object({
	calendar: z.array(zDayInterface).optional(),
	saved: z.array(z.union([zBookmarkInterface, zRecipeInterface])).optional(),
	tags: z.array(zTagInterface).optional(),
});

type PlannerInterface = z.infer<typeof zPlannerInterface>;

const plannerSchema = new Schema<PlannerInterface>({
	calendar: [daySchema],
	saved: [
		{
			type: SchemaTypes.Union,
			of: [bookmarkSchema, recipeSchema],
		},
	],
	tags: [tagSchema],
});

export const Planner: Model<PlannerInterface> =
	models.Planner || model<PlannerInterface>('Planner', plannerSchema);
