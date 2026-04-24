'use client';

import { useCallback, useEffect, useState } from 'react';

import { cancelInvite } from '@/_actions/planner/cancelInvite';
import { getPendingInvites } from '@/_actions/planner/getPendingInvites';
import type { PendingInvite } from '@/_actions/planner/invite.types';
import { inviteUser } from '@/_actions/planner/inviteUser';
import type { AccessLevel } from '@/_models/user';

type InviteStatus = 'idle' | 'loading' | 'success' | 'error';

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

export const useInvites = (plannerId: string): UseInvitesResult => {
	const [invites, setInvites] = useState<PendingInvite[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [inviteStatus, setInviteStatus] = useState<InviteStatus>('idle');
	const [inviteError, setInviteError] = useState<string | null>(null);
	const [cancelStatus, setCancelStatus] = useState<InviteStatus>('idle');
	const [cancelError, setCancelError] = useState<string | null>(null);

	const fetchInvites = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const result = await getPendingInvites(plannerId);

			if (result.error) {
				setError(result.error);
				setInvites([]);
			} else {
				setInvites(result.invites);
			}
		} catch {
			setError('Failed to fetch invites');
			setInvites([]);
		} finally {
			setLoading(false);
		}
	}, [plannerId]);

	useEffect(() => {
		fetchInvites();
	}, [fetchInvites]);

	const refresh = useCallback(async () => {
		const result = await getPendingInvites(plannerId);
		if (!result.error) {
			setInvites(result.invites);
		}
	}, [plannerId]);

	const inviteUserFn = useCallback(
		async (email: string, accessLevel?: AccessLevel): Promise<boolean> => {
			setInviteStatus('loading');
			setInviteError(null);

			try {
				const result = await inviteUser({
					plannerId,
					email,
					accessLevel,
				});

				if (result.success) {
					setInviteStatus('success');
					setInviteError(null);
					await refresh();
					return true;
				} else {
					setInviteStatus('error');
					setInviteError(result.error || 'Failed to invite user');
					return false;
				}
			} catch (err) {
				setInviteStatus('error');
				setInviteError(
					err instanceof Error ? err.message : 'Failed to invite user',
				);
				return false;
			}
		},
		[plannerId, refresh],
	);

	const cancelInviteFn = useCallback(
		async (inviteId: string): Promise<boolean> => {
			setCancelStatus('loading');
			setCancelError(null);

			// Store the invite to restore on failure
			const inviteToCancel = invites.find((i) => i.id === inviteId);

			// Optimistic update: remove immediately
			setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));

			try {
				const result = await cancelInvite({
					plannerId,
					inviteId,
				});

				if (result.success) {
					setCancelStatus('success');
					setCancelError(null);
					return true;
				} else {
					// Restore invite on failure
					if (inviteToCancel) {
						setInvites((prev) => [...prev, inviteToCancel]);
					}
					setCancelStatus('error');
					setCancelError(result.error || 'Failed to cancel invite');
					return false;
				}
			} catch (err) {
				// Restore invite on error
				if (inviteToCancel) {
					setInvites((prev) => [...prev, inviteToCancel]);
				}
				setCancelStatus('error');
				setCancelError(
					err instanceof Error ? err.message : 'Failed to cancel invite',
				);
				return false;
			}
		},
		[plannerId, invites],
	);

	return {
		invites,
		loading,
		error,
		inviteStatus,
		inviteError,
		cancelStatus,
		cancelError,
		refresh,
		inviteUser: inviteUserFn,
		cancelInvite: cancelInviteFn,
	};
};
