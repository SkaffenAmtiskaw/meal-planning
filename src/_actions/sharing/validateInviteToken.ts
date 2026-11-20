'use server';

import { pendingInvites } from '@/_models/database/pendingInvites';
import { planners } from '@/_models/database/planners';
import { reportError } from '@/_reporting/reportError';
import { catchify } from '@/_utils/catchify';

interface ValidateInviteTokenResult {
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

	// acceptInvite removes an expired invite, so this read leaves it in place.
	if (invite.expiresAt < new Date()) {
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
