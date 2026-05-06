'use server';

import { PendingInvite, Planner } from '@/_models';
import { catchify } from '@/_utils/catchify';

export interface ValidateInviteTokenResult {
	valid: boolean;
	email?: string;
	plannerName?: string;
	reason?: 'expired' | 'invalid';
}

export const validateInviteToken = async (
	token: string,
): Promise<ValidateInviteTokenResult> => {
	// Use catchify for findOne
	const [invite, findError] = await catchify(() =>
		PendingInvite.findOne({ token }),
	);

	if (findError || !invite) {
		return { valid: false, reason: 'invalid' };
	}

	// Check if invite is expired
	const now = new Date();
	if (invite.expiresAt < now) {
		// Delete the expired invite - don't wait for result
		catchify(() => invite.deleteOne());
		return { valid: false, reason: 'expired', email: invite.email };
	}

	// Invite is valid - look up the planner
	const [planner] = await catchify(() => Planner.findById(invite.planner));

	return {
		valid: true,
		email: invite.email,
		plannerName: planner?.name ?? 'Meal Planner',
	};
};
