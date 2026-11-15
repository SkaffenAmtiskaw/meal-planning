'use server';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { User } from '@/_models/user';
import { serialize } from '@/_utils/serialize';

import type { PlannerMember } from './getPlannerMembers.types';

export const getPlannerMembers = async (
	plannerId: string,
): Promise<{ members: PlannerMember[]; error?: string }> => {
	// Verify caller has admin or owner access
	const authResult = await checkAuth(plannerId, 'admin');

	if (
		authResult.type === 'unauthenticated' ||
		authResult.type === 'unauthorized'
	) {
		return serialize({ members: [], error: 'Unauthorized' });
	}

	if (authResult.type === 'error') {
		throw authResult.error;
	}

	// Query users who have access to this planner
	const users = await User.find({ 'planners.planner': plannerId }).lean();

	// Map to sanitized member data
	const members: PlannerMember[] = users.map((user) => {
		const membership = user.planners.find((p) => p.planner === plannerId);

		return {
			name: user.name ?? 'New User',
			email: user.email ?? '',
			accessLevel: membership?.accessLevel ?? 'read',
		};
	});

	return serialize({ members });
};
