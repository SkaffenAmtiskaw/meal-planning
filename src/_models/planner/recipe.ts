import { Schema, SchemaTypes } from 'mongoose';
import { z } from 'zod';

import { zObjectId } from '@/_models/_utils/zObjectId';

export const zRecipeInterface = z.object({
	_id: zObjectId,
	ingredients: z.array(z.string()),
	instructions: z.array(z.string()),
	name: z.string(),
	notes: z.string().optional(),
	servings: z.number().optional(),
	source: z
		.object({
			name: z.string(),
			url: z.url().optional(),
		})
		.optional(),
	storage: z.string().optional(),
	tags: z.array(zObjectId).optional(),
	time: z
		.object({
			prep: z.string().optional(),
			cook: z.string().optional(),
			total: z.string().optional(),
			actual: z.string().optional(),
		})
		.optional(),
});

export const zRecipeFormSchema = zRecipeInterface.omit({ _id: true }).extend({
	plannerId: z.string(),
});

export type RecipeInterface = z.infer<typeof zRecipeInterface>;

export const recipeSchema = new Schema<RecipeInterface>({
	_id: SchemaTypes.ObjectId,
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
