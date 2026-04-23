'use server';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { User } from '@/_models';
import type { AccessLevel } from '@/_models/user';

export const updateMemberAccess = async (
	plannerId: string,
	targetUserEmail: string,
	newAccessLevel: AccessLevel,
): Promise<{ ok: true } | { ok: false; error: string }> => {
	// 1. Validate caller is authenticated and has access to this planner
	const authResult = await checkAuth(
		plannerId as unknown as import('mongoose').Types.ObjectId,
		'read',
	);
	if (authResult.type !== 'authorized') {
		return { ok: false, error: 'Unauthorized' };
	}

	const callerAccessLevel = authResult.accessLevel;

	// 2. Only owner or admin can change access
	if (!['owner', 'admin'].includes(callerAccessLevel)) {
		return { ok: false, error: 'Insufficient permissions' };
	}

	// 3. Find target user
	const targetUser = await User.findOne({ email: targetUserEmail });
	if (!targetUser) {
		return { ok: false, error: 'User not found' };
	}

	// 4. Get target's current access level in this planner
	const targetMembership = targetUser.planners.find(
		(p) => p.planner.toString() === plannerId,
	);

	if (!targetMembership) {
		return { ok: false, error: 'User is not a member of this planner' };
	}

	const targetCurrentAccess = targetMembership.accessLevel;

	// 5. Cannot change owner's access
	if (targetCurrentAccess === 'owner') {
		return { ok: false, error: 'Cannot change owner access' };
	}

	// 6. Admin cannot change other admins (only owner can)
	if (callerAccessLevel === 'admin' && targetCurrentAccess === 'admin') {
		return { ok: false, error: 'Admins cannot modify other admins' };
	}

	// 7. Update the access level
	await User.updateOne(
		{ _id: targetUser._id, 'planners.planner': plannerId },
		{ $set: { 'planners.$.accessLevel': newAccessLevel } },
	);

	return { ok: true };
};
