import type { PlannerMember } from '@/_actions/planner/getPlannerMembers.types';

export interface CanModifyMemberParams {
	member: PlannerMember;
	currentUserEmail: string | null;
	currentUserIsOwner: boolean;
}

/**
 * Pure function that determines if the current user can modify a member.
 * Rules:
 * - Cannot modify yourself
 * - Cannot modify owner
 * - Admin cannot modify other admins
 */
export const canModifyMember = (params: CanModifyMemberParams): boolean => {
	const { member, currentUserEmail, currentUserIsOwner } = params;

	// Cannot modify yourself
	if (member.email === currentUserEmail) {
		return false;
	}

	// Cannot modify owner
	if (member.accessLevel === 'owner') {
		return false;
	}

	// Admin cannot modify other admins
	if (!currentUserIsOwner && member.accessLevel === 'admin') {
		return false;
	}

	return true;
};
