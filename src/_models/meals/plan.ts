import { Schema, SchemaTypes } from 'mongoose';
import { z } from 'zod';
import { zObjectId } from '../_utils/zObjectId';

const zDishInterface = z.object({
	name: z.string(),
	source: z
		.union([
			z.string(),
			z.object({
				name: z.string(),
				url: z.url(),
			}),
			zObjectId,
		])
		.optional(),
	note: z.string().optional(),
});

const zMealInterface = z.object({
	name: z.string(),
	description: z.string().optional(),
	dishes: z.array(zDishInterface),
});

export const zPlanInterface = z.object({
	date: z.iso.date(),
	meals: z.array(zMealInterface).optional(),
});

export type PlanInterface = z.infer<typeof zPlanInterface>;

export const planSchema = new Schema<PlanInterface>({
	date: { type: String, required: true },
	meals: [
		{
			date: { type: String, required: true },
			meals: [
				{
					name: { type: String, required: true },
					description: String,
					dishes: [
						{
							name: { type: String, required: true },
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
									{
										type: SchemaTypes.ObjectId,
									},
								],
							},
						},
					],
				},
			],
		},
	],
});
