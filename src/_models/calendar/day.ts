import { Schema, SchemaTypes } from 'mongoose';
import { z } from 'zod';

import type { DayInterface } from './day.types';

export * from './day.types';

// Meals and dishes are their own schemas, rather than defined inline in the day,
// so they keep their stored `_id`: inline arrays would take the day's `_id: false`.
const dishSchema = new Schema({
	name: { type: String, required: true },
	source: {
		type: SchemaTypes.Union,
		of: [
			String,
			{
				url: {
					type: String,
					validate: [
						(v: unknown) => z.url().safeParse(v).success,
						'Source URL is invalid',
					],
				},
			},
			{
				ref: { type: String },
			},
			{
				type: SchemaTypes.ObjectId,
			},
		],
	},
	note: String,
});

const mealSchema = new Schema({
	name: { type: String, required: true },
	description: String,
	dishes: [dishSchema],
});

export const daySchema = new Schema<DayInterface>(
	{
		date: { type: String, required: true },
		meals: [mealSchema],
	},
	// A day is found by its `date`, which is unique within a planner, so it needs no `_id`.
	{ _id: false },
);
