import type { Model } from 'mongoose';
import { model, models, Schema, SchemaTypes } from 'mongoose';
import { z } from 'zod';

import { zObjectId } from './_utils/zObjectId';

export const zUserInterface = z.object({
	meals: z.array(zObjectId),
});

export type UserInterface = z.infer<typeof zUserInterface>;

const userSchema = new Schema<UserInterface>({
	meals: [
		{
			type: SchemaTypes.ObjectId,
			ref: 'Meals',
			required: true,
		},
	],
});

export const User: Model<UserInterface> =
	models.User || model<UserInterface>('User', userSchema);
