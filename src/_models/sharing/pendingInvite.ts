import type { Model } from 'mongoose';
// mongoose doesn't export `models` to ES modules, so it's read from the default export.
import mongoose, { model, Schema } from 'mongoose';

import type { PendingInviteInterface } from './pendingInvite.types';

import { newId } from '../database/newId';

export * from './pendingInvite.types';

// The zod schema gets its required `_id` once each creator sets one.
type StoredPendingInvite = PendingInviteInterface & { _id: string };

const pendingInviteSchema = new Schema<StoredPendingInvite>({
	// Mongoose won't save a String `_id` it isn't given, so it defaults to a new one until its creator sets it.
	_id: { type: String, default: newId },
	email: {
		type: String,
		required: true,
	},
	planner: {
		type: String,
		required: true,
	},
	invitedBy: {
		type: String,
		required: true,
	},
	accessLevel: {
		type: String,
		enum: ['owner', 'admin', 'write', 'read'],
		required: true,
	},
	token: {
		type: String,
		required: true,
	},
	expiresAt: {
		type: Date,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

export const PendingInvite: Model<StoredPendingInvite> =
	mongoose.models.PendingInvite ||
	model<StoredPendingInvite>('PendingInvite', pendingInviteSchema);
