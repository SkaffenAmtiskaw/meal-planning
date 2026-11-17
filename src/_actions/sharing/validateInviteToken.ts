'use server';

import { pendingInvites } from '@/_models/database/pendingInvites';
import { planners } from '@/_models/database/planners';
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
		pendingInvites.findOne({ token }),
	);

	if (findError || !invite) {
		if (findError) await reportError(findError);
		return { valid: false, reason: 'invalid' };
	}

	// Check if invite is expired
	const now = new Date();
	if (invite.expiresAt < now) {
		// Delete the expired invite - don't wait for result
		catchify(() => pendingInvites.deleteOne({ _id: invite._id }));
		return { valid: false, reason: 'expired', email: invite.email };
	}

	// Invite is valid - look up the planner
	const [planner, plannerError] = await catchify(() =>
		planners.findOne({ _id: invite.planner }),
	);
	if (plannerError) await reportError(plannerError);

	return {
		valid: true,
		email: invite.email,
		plannerName: planner?.name ?? 'Meal Planner',
	};
};
