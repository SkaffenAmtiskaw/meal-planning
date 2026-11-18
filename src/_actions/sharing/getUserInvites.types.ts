import type { AccessLevel } from '@/_models/user';

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

export interface GetUserInvitesResult {
	invites: UserInvite[];
	error?: string;
}
