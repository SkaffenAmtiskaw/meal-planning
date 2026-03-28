import type { Model } from 'mongoose';
import { model, models, Schema, SchemaTypes } from 'mongoose';

import type { UserInterface } from './user.types';

export * from './user.types';

const userSchema = new Schema<UserInterface>({
	email: {
		type: String,
		unique: true,
	},
	planners: [
		{
			type: SchemaTypes.ObjectId,
			ref: 'Planner',
			required: true,
		},
	],
});

export const User: Model<UserInterface> =
	models.User || model<UserInterface>('User', userSchema);
