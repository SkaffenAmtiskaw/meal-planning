import { Schema, SchemaTypes } from 'mongoose';
import { z } from 'zod';

import type { DayInterface } from './day.types';

export * from './day.types';

export const daySchema = new Schema<DayInterface>({
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
