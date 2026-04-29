'use server';

import { Types } from 'mongoose';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { removePlannerMembership } from '@/_actions/planner/_utils/removePlannerMembership';
import type { ActionResult } from '@/_utils/actionResult';

export const leavePlanner = async (
	plannerId: string,
): Promise<ActionResult> => {
	// 1. Verify caller is authenticated and is a member of the planner
	const authResult = await checkAuth(new Types.ObjectId(plannerId), 'read');

	if (authResult.type !== 'authorized') {
		return { ok: false, error: 'Unauthorized' };
	}

	// 2. Verify caller is NOT the owner (owners cannot leave via this action)
	if (authResult.accessLevel === 'owner') {
		return {
			ok: false,
			error: 'Owners cannot leave a planner. Transfer ownership first.',
		};
	}

	// 3. Get the current user's ID from auth result
	const user = authResult.user;

	// 4. Call removePlannerMembership to remove the user's membership from the planner
	const removalResult = await removePlannerMembership(
		user._id.toString(),
		plannerId,
	);

	// 5. Return appropriate result
	if (!removalResult.ok) {
		return {
			ok: false,
			error: removalResult.error ?? 'Failed to leave planner',
		};
	}

	return { ok: true, data: undefined };
};
