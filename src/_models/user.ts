import type { Model } from 'mongoose';
import { model, models, Schema, SchemaTypes } from 'mongoose';
import { z } from 'zod';

import { zObjectId } from './_utils/zObjectId';

export const zUserInterface = z.object({
	email: z.string(),
	planner: z.array(zObjectId),
});

export type UserInterface = z.infer<typeof zUserInterface>;

const userSchema = new Schema<UserInterface>({
	email: {
		type: String,
		unique: true,
	},
	planner: [
		{
			type: SchemaTypes.ObjectId,
			ref: 'Planner',
			required: true,
		},
	],
});

export const User: Model<UserInterface> =
	models.User || model<UserInterface>('User', userSchema);
