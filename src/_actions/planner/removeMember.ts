'use server';

import { Types } from 'mongoose';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { removePlannerMembership } from '@/_actions/planner/_utils/removePlannerMembership';
import { User } from '@/_models';

export interface RemoveMemberResult {
	ok: boolean;
	error?: string;
}

export const removeMember = async (
	plannerId: string,
	memberEmail: string,
): Promise<RemoveMemberResult> => {
	// 1. Verify caller is authenticated and has admin+ access to the planner
	const authResult = await checkAuth(new Types.ObjectId(plannerId), 'admin');

	if (authResult.type !== 'authorized') {
		return { ok: false, error: 'Unauthorized' };
	}

	// 2. Find the target user by email
	const targetUser = await User.findOne({ email: memberEmail });

	// 3. Verify target user exists
	if (!targetUser) {
		return { ok: false, error: 'User not found' };
	}

	// 4. Verify target user is actually a member of this planner
	const targetMembership = targetUser.planners.find(
		(p) => p.planner.toString() === plannerId,
	);

	if (!targetMembership) {
		return { ok: false, error: 'User is not a member of this planner' };
	}

	// 5. Verify target user is NOT an owner (owners cannot be removed via this action)
	if (targetMembership.accessLevel === 'owner') {
		return { ok: false, error: 'Cannot remove owner' };
	}

	// 6. Call removePlannerMembership utility to remove the membership
	const removalResult = await removePlannerMembership(
		targetUser._id.toString(),
		plannerId,
	);

	// 7. Return appropriate result
	if (!removalResult.ok) {
		return { ok: false, error: removalResult.error };
	}

	return { ok: true };
};
