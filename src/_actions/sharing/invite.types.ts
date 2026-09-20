import type { AccessLevel } from '@/_models/user';

export interface PendingInvite {
	id: string;
	email: string;
	accessLevel: AccessLevel;
	invitedAt: string;
	expiresAt: string;
}
