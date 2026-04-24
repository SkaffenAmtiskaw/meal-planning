import 'server-only';

import { PendingInvite, Planner, User } from '@/_models';
import type { AccessLevel } from '@/_models/user';
import { serialize } from '@/_utils/serialize';

// Return type for pending invites with populated data
export interface UserInvite {
	id: string;
	plannerId: string;
	plannerName: string;
	invitedBy: string; // inviter's name
	accessLevel: AccessLevel;
	invitedAt: string;
	expiresAt: string;
	token: string;
}

export interface GetUserInvitesResult {
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
		const invites = await PendingInvite.find({ email }).sort({
			createdAt: -1,
		});

		// For each invite, populate planner name and inviter name
		const userInvites: UserInvite[] = await Promise.all(
			invites.map(async (invite) => {
				// Fetch planner and inviter in parallel
				const [planner, inviter] = await Promise.all([
					Planner.findById(invite.planner.toString()),
					User.findById(invite.invitedBy.toString()),
				]);

				return {
					id: invite._id.toString(),
					plannerId: invite.planner.toString(),
					plannerName: planner?.name ?? 'Unknown Planner',
					invitedBy: inviter?.name ?? 'Unknown User',
					accessLevel: invite.accessLevel,
					invitedAt: invite.createdAt.toISOString(),
					expiresAt: invite.expiresAt.toISOString(),
					token: invite.token,
				};
			}),
		);

		return serialize({ invites: userInvites });
	} catch {
		return { invites: [], error: 'Failed to fetch invites' };
	}
};
