'use server';

import { Types } from 'mongoose';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { PendingInvite as PendingInviteModel } from '@/_models';
import { serialize } from '@/_utils/serialize';

import type { PendingInvite } from './invite.types';

export type { PendingInvite } from './invite.types';

export interface GetPendingInvitesResult {
	invites: PendingInvite[];
	error?: string;
}

export const getPendingInvites = async (
	plannerId: string,
): Promise<GetPendingInvitesResult> => {
	try {
		// Validate plannerId is a valid ObjectId
		if (!Types.ObjectId.isValid(plannerId)) {
			return { invites: [], error: 'Unauthorized' };
		}

		// Verify caller is authenticated and has admin access
		const authResult = await checkAuth(new Types.ObjectId(plannerId), 'admin');

		if (
			authResult.type === 'unauthenticated' ||
			authResult.type === 'unauthorized' ||
			authResult.type === 'error'
		) {
			return { invites: [], error: 'Unauthorized' };
		}

		// Query pending invites for this planner, sorted by createdAt descending
		const invites = await PendingInviteModel.find({ planner: plannerId }).sort({
			createdAt: -1,
		});

		// Map to PendingInvite with only the required fields
		const pendingInvites: PendingInvite[] = invites.map((invite) => ({
			id: invite._id.toString(),
			email: invite.email,
			accessLevel: invite.accessLevel,
			invitedAt: invite.createdAt.toISOString(),
			expiresAt: invite.expiresAt.toISOString(),
		}));

		return serialize({ invites: pendingInvites });
	} catch {
		return { invites: [], error: 'Failed to fetch pending invites' };
	}
};
