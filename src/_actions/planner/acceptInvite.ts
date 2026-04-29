'use server';

import { getUser } from '@/_actions';
import { PendingInvite, User } from '@/_models';
import type { AccessLevel } from '@/_models/user';
import type { ActionResult } from '@/_utils/actionResult/ActionResult';

export interface AcceptInviteInput {
	token: string;
}

export interface AcceptInviteResult {
	plannerId: string;
}

export const acceptInvite = async (
	input: AcceptInviteInput,
): Promise<ActionResult<AcceptInviteResult>> => {
	try {
		// Get the current authenticated user
		const user = await getUser();

		// If user is not authenticated, return error
		if (!user) {
			return { ok: false, error: 'Unauthorized' };
		}

		// Find the pending invite by token
		const invite = await PendingInvite.findOne({ token: input.token });

		// If invite not found, return error
		if (!invite) {
			return { ok: false, error: 'Invite not found' };
		}

		// Verify invite has not expired
		const now = new Date();
		if (invite.expiresAt < now) {
			// Delete the expired invite
			await invite.deleteOne();
			return { ok: false, error: 'Invite has expired' };
		}

		// Verify the invite email matches the authenticated user's email
		if (invite.email !== user.email) {
			return {
				ok: false,
				error: 'This invite is for a different email address',
			};
		}

		const plannerId = invite.planner.toString();

		// Check if user is already a member of this planner
		const isAlreadyMember = user.planners?.some(
			(membership) => membership.planner.toString() === plannerId,
		);

		// If already a member, delete the invite and return success (idempotent)
		if (isAlreadyMember) {
			await invite.deleteOne();
			return { ok: true, data: { plannerId } };
		}

		// Add the planner to user's planners array with the accessLevel from the invite
		await User.updateOne(
			{ _id: user._id },
			{
				$push: {
					planners: {
						planner: plannerId,
						accessLevel: invite.accessLevel as AccessLevel,
					},
				},
			},
		);

		// Delete the pending invite
		await invite.deleteOne();

		// Return success
		return { ok: true, data: { plannerId } };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : 'An error occurred',
		};
	}
};
