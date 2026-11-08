'use server';

import { Planner } from '@/_models/planner';
import { PendingInvite } from '@/_models/sharing';
import { catchify } from '@/_utils/catchify';
import { reportError } from '@/_utils/reportError';

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
		if (findError) await reportError(findError);
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
	const [planner, plannerError] = await catchify(() =>
		Planner.findById(invite.planner),
	);
	if (plannerError) await reportError(plannerError);

	return {
		valid: true,
		email: invite.email,
		plannerName: planner?.name ?? 'Meal Planner',
	};
};
