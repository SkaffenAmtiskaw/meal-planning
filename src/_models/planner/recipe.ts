import { Schema, SchemaTypes, Types } from 'mongoose';
import { z } from 'zod';

import type { RecipeInterface } from './recipe.types';

export * from './recipe.types';

export const recipeSchema = new Schema<RecipeInterface>({
	_id: { type: SchemaTypes.ObjectId, default: () => new Types.ObjectId() },
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
	tags: [
		{
			type: SchemaTypes.ObjectId,
			ref: 'Tag',
		},
	],
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
