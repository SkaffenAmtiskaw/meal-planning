import type { Model } from 'mongoose';
// mongoose doesn't export `models` to ES modules, so it's read from the default export.
import mongoose, { model, Schema } from 'mongoose';

import type { PendingInviteInterface } from './pendingInvite.types';

export * from './pendingInvite.types';

const pendingInviteSchema = new Schema<PendingInviteInterface>({
	_id: { type: String, required: true },
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

export const PendingInvite: Model<PendingInviteInterface> =
	mongoose.models.PendingInvite ||
	model<PendingInviteInterface>('PendingInvite', pendingInviteSchema);
