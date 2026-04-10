import type { Model } from 'mongoose';
import { model, models, Schema, SchemaTypes } from 'mongoose';

import type { UserInterface } from './user.types';

export * from './user.types';

const userSchema = new Schema<UserInterface>({
	email: {
		type: String,
		unique: true,
	},
	name: {
		type: String,
		default: 'New User',
	},
	planners: [
		{
			planner: {
				type: SchemaTypes.ObjectId,
				ref: 'Planner',
				required: true,
			},
			accessLevel: {
				type: String,
				enum: ['owner', 'admin', 'write', 'read'],
				required: true,
			},
		},
	],
	pendingEmailChange: {
		email: { type: String },
		token: { type: String },
		expiresAt: { type: Date },
	},
});

export const User: Model<UserInterface> =
	models.User || model<UserInterface>('User', userSchema);
