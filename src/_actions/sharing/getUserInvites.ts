import 'server-only';

import { pendingInvites } from '@/_models/database/pendingInvites';
import { planners } from '@/_models/database/planners';
import { users } from '@/_models/database/users';
import { reportError } from '@/_reporting/reportError';

import type { UserInvite } from './types';

interface GetUserInvitesResult {
	invites: UserInvite[];
	error?: string;
}

// Main function
export const getUserInvites = async (
	email: string,
): Promise<GetUserInvitesResult> => {
	try {
		// If email is not provided, return error
		if (!email) {
			return { invites: [], error: 'Unauthorized' };
		}

		// Query pending invites for this user's email, sorted by createdAt descending
		const invites = await pendingInvites
			.find({ email })
			.sort({ createdAt: -1 })
			.toArray();

		// For each invite, populate planner name and inviter name
		const userInvites: UserInvite[] = await Promise.all(
			invites.map(async (invite) => {
				// Fetch planner and inviter in parallel
				const [planner, inviter] = await Promise.all([
					planners.findOne({ _id: invite.planner }),
					users.findOne({ _id: invite.invitedBy }),
				]);

				return {
					id: invite._id,
					plannerId: invite.planner,
					plannerName: planner?.name ?? 'Unknown Planner',
					invitedBy: inviter?.name ?? 'Unknown User',
					accessLevel: invite.accessLevel,
					invitedAt: invite.createdAt.toISOString(),
					expiresAt: invite.expiresAt.toISOString(),
					token: invite.token,
				};
			}),
		);

		return { invites: userInvites };
	} catch (error) {
		await reportError(error);
		return { invites: [], error: 'Failed to fetch invites' };
	}
};
