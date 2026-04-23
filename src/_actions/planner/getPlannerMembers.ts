'use server';

import { Types } from 'mongoose';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { User } from '@/_models';
import type { AccessLevel } from '@/_models/user';

export interface PlannerMember {
	name: string;
	email: string;
	accessLevel: AccessLevel;
}

export const getPlannerMembers = async (
	plannerId: string | Types.ObjectId,
): Promise<PlannerMember[] | { ok: false; error: string }> => {
	// Convert string to ObjectId if needed
	const objectId =
		typeof plannerId === 'string' ? new Types.ObjectId(plannerId) : plannerId;

	// Verify caller has admin or owner access
	const authResult = await checkAuth(objectId, 'admin');

	if (
		authResult.type === 'unauthenticated' ||
		authResult.type === 'unauthorized'
	) {
		return { ok: false, error: 'Unauthorized' };
	}

	if (authResult.type === 'error') {
		throw authResult.error;
	}

	// Query users who have access to this planner
	const users = await User.find({ 'planners.planner': plannerId }).lean();

	// Map to sanitized member data
	const plannerIdString = plannerId.toString();
	const members: PlannerMember[] = users.map((user) => {
		const membership = user.planners.find((p) => {
			const memberPlannerId =
				typeof p.planner === 'string' ? p.planner : p.planner.toString();
			return memberPlannerId === plannerIdString;
		});

		return {
			name: user.name ?? 'New User',
			email: user.email ?? '',
			accessLevel: membership?.accessLevel ?? 'read',
		};
	});

	return members;
};
