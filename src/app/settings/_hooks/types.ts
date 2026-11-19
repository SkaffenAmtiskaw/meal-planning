import type { PendingInvite } from '@/_actions/sharing';
import type { AccessLevel } from '@/_models/types';

export type InviteStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseInvitesResult {
	invites: PendingInvite[];
	loading: boolean;
	error: string | null;
	inviteStatus: InviteStatus;
	inviteError: string | null;
	cancelStatus: InviteStatus;
	cancelError: string | null;
	refresh: () => Promise<void>;
	inviteUser: (email: string, accessLevel?: AccessLevel) => Promise<boolean>;
	cancelInvite: (inviteId: string) => Promise<boolean>;
}
