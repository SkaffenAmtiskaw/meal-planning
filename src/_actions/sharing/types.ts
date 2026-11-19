import type { AccessLevel } from '@/_models/user';

export interface AcceptInviteInput {
	token: string;
}

export interface AcceptInviteResult {
	plannerId: string;
}

export interface DeclineInviteInput {
	inviteId: string;
}

export interface PendingInvite {
	id: string;
	email: string;
	accessLevel: AccessLevel;
	invitedAt: string;
	expiresAt: string;
}

export interface PlannerMember {
	name: string;
	email: string;
	accessLevel: AccessLevel;
}

// Return type for pending invites with populated data
export interface UserInvite {
	id: string;
	plannerId: string;
	plannerName: string;
	invitedBy: string; // inviter's name
	accessLevel: AccessLevel;
	invitedAt: string;
	expiresAt: string;
	token: string;
}
