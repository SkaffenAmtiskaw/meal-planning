import type { Model } from 'mongoose';
import { model, models, Schema, SchemaTypes } from 'mongoose';

import type { PlannerInterface } from '@/_models/planner';
import { bookmarkSchema } from '@/_models/planner/bookmark';
import { daySchema } from '@/_models/planner/day';

import { recipeSchema } from './recipe';
import { tagSchema } from './tag';

export * from './planner.types';

const plannerSchema = new Schema<PlannerInterface>({
	name: {
		type: String,
	},
	calendar: [
		{
			type: daySchema,
			required: true,
		},
	],
	saved: [
		{
			type: SchemaTypes.Union,
			of: [bookmarkSchema, recipeSchema],
			required: true,
		},
	],
	tags: [
		{
			type: tagSchema,
			required: true,
		},
	],
});

export const Planner: Model<PlannerInterface> =
	models.Planner || model<PlannerInterface>('Planner', plannerSchema);
