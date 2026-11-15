import type { Model } from 'mongoose';
// mongoose doesn't export `models` to ES modules, so it's read from the default export.
import mongoose, { model, Schema, SchemaTypes } from 'mongoose';

import { daySchema } from '@/_models/calendar';
import { newId } from '@/_models/database/newId';
import { bookmarkSchema, recipeSchema, tagSchema } from '@/_models/library';
import type { PlannerInterface } from '@/_models/planner';

export * from './planner.types';

// The zod schema gets its required `_id` once each creator sets one.
type StoredPlanner = PlannerInterface & { _id: string };

const plannerSchema = new Schema<StoredPlanner>({
	// Mongoose won't save a String `_id` it isn't given, so it defaults to a new one until its creator sets it.
	_id: { type: String, default: newId },
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

export const Planner: Model<StoredPlanner> =
	mongoose.models.Planner || model<StoredPlanner>('Planner', plannerSchema);
