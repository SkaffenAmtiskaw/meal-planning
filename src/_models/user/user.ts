import type { Model } from 'mongoose';
// mongoose doesn't export `models` to ES modules, so it's read from the default export.
import mongoose, { model, Schema } from 'mongoose';

import type { UserInterface } from './user.types';

import { newId } from '../database/newId';

export * from './user.types';

// The zod schema gets its required `_id` once each creator sets one.
type StoredUser = UserInterface & { _id: string };

// Mongoose won't save a String `_id` it isn't given, so each `_id` defaults to a new one until its creator sets it.
export const userSchema = new Schema<StoredUser>({
	_id: { type: String, default: newId },
	email: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		type: String,
		default: 'New User',
	},
	planners: [
		{
			_id: { type: String, default: newId },
			planner: {
				type: String,
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

userSchema.index({ 'planners.planner': 1 });

export const User: Model<StoredUser> =
	mongoose.models.User || model<StoredUser>('User', userSchema);
