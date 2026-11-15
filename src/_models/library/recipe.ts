import { Schema, SchemaTypes } from 'mongoose';
import { z } from 'zod';

import type { RecipeInterface } from './recipe.types';

import { newId } from '../database/newId';

export * from './recipe.types';

export const recipeSchema = new Schema<RecipeInterface>({
	// Mongoose won't save a String `_id` it isn't given, so it defaults to a new one until its creator sets it.
	_id: { type: String, default: newId },
	ingredients: { type: [String], required: true },
	instructions: { type: [String], required: true },
	name: { type: String, required: true },
	notes: String,
	servings: Number,
	source: {
		type: SchemaTypes.Union,
		of: [
			String,
			{
				name: String,
				url: {
					type: String,
					validate: [
						(v: unknown) => z.url().safeParse(v).success,
						'Source URL is invalid',
					],
				},
			},
		],
	},
	storage: String,
	tags: [String],
	time: {
		type: SchemaTypes.Union,
		of: [
			Number,
			{
				prep: Number,
				cook: Number,
			},
		],
	},
});
