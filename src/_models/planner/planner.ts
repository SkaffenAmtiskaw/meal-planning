import type { Model } from 'mongoose';
// mongoose doesn't export `models` to ES modules, so it's read from the default export.
import mongoose, { model, Schema, SchemaTypes } from 'mongoose';

import { daySchema } from '@/_models/calendar';
import { bookmarkSchema, recipeSchema, tagSchema } from '@/_models/library';
import type { PlannerInterface } from '@/_models/planner';

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
	mongoose.models.Planner || model<PlannerInterface>('Planner', plannerSchema);
