import { Schema, SchemaTypes } from 'mongoose';

import { z } from 'zod';
import { zObjectId } from '../_utils/zObjectId';

export const zRecipeInterface = z.object({
	_id: zObjectId,
	ingredients: z.array(z.string()),
	instructions: z.array(z.string()),
	name: z.string(),
	notes: z.string().optional(),
	servings: z.number().optional(),
	source: z
		.union([
			z.string(),
			z.object({
				name: z.string(),
				url: z.url(),
			}),
		])
		.optional(),
	storage: z.string().optional(),
	tags: z.array(zObjectId).optional(),
	time: z
		.union([
			z.number(),
			z.object({
				prep: z.number(),
				cook: z.number(),
			}),
		])
		.optional(),
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
