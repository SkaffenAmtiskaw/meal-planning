'use server';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { users } from '@/_models/database/users';

import type { PlannerMember } from './types';

export const getPlannerMembers = async (
	plannerId: string,
): Promise<{ members: PlannerMember[]; error?: string }> => {
	// Verify caller has admin or owner access
	const authResult = await checkAuth(plannerId, 'admin');

	if (
		authResult.type === 'unauthenticated' ||
		authResult.type === 'unauthorized'
	) {
		return { members: [], error: 'Unauthorized' };
	}

	if (authResult.type === 'error') {
		throw authResult.error;
	}

	// Query users who have access to this planner
	const memberUsers = await users
		.find({ 'planners.planner': plannerId })
		.toArray();

	// Map to sanitized member data
	const members: PlannerMember[] = memberUsers.map((user) => {
		const membership = user.planners.find((p) => p.planner === plannerId);

		return {
			name: user.name ?? 'New User',
			email: user.email ?? '',
			accessLevel: membership?.accessLevel ?? 'read',
		};
	});

	return { members };
};
