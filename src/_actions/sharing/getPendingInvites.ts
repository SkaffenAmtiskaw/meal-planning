'use server';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { pendingInvites } from '@/_models/database/pendingInvites';
import { reportError } from '@/_utils/reportError';
import { zId } from '@/_utils/zId';

import type { PendingInvite } from './getPendingInvites.types';

interface GetPendingInvitesResult {
	invites: PendingInvite[];
	error?: string;
}

export const getPendingInvites = async (
	plannerId: string,
): Promise<GetPendingInvitesResult> => {
	try {
		// Validate plannerId has the shape of an id
		if (!zId.safeParse(plannerId).success) {
			return { invites: [], error: 'Unauthorized' };
		}

		// Verify caller is authenticated and has admin access
		const authResult = await checkAuth(plannerId, 'admin');

		if (
			authResult.type === 'unauthenticated' ||
			authResult.type === 'unauthorized' ||
			authResult.type === 'error'
		) {
			return { invites: [], error: 'Unauthorized' };
		}

		// Query pending invites for this planner, sorted by createdAt descending
		const invites = await pendingInvites
			.find({ planner: plannerId })
			.sort({ createdAt: -1 })
			.toArray();

		// Map to PendingInvite with only the required fields
		const result: PendingInvite[] = invites.map((invite) => ({
			id: invite._id,
			email: invite.email,
			accessLevel: invite.accessLevel,
			invitedAt: invite.createdAt.toISOString(),
			expiresAt: invite.expiresAt.toISOString(),
		}));

		return { invites: result };
	} catch (error) {
		await reportError(error);
		return { invites: [], error: 'Failed to fetch pending invites' };
	}
};
