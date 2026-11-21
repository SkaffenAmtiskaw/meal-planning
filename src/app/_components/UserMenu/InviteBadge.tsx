import 'server-only';

import { Suspense } from 'react';

import { getUserInvites } from '@/_actions/sharing/getUserInvites';
import { getUser } from '@/_actions/user';
import { isNoSessionError } from '@/_actions/user/noSessionError';
import { reportError } from '@/_reporting/reportError';

import { InviteCountBadge } from './InviteCountBadge';

interface InviteBadgeProps {
	children: React.ReactNode;
}

// Exported so the tests can await it directly rather than through Suspense.
export async function InviteBadgeWithData({ children }: InviteBadgeProps) {
	try {
		const user = await getUser();

		if (!user) {
			return <>{children}</>;
		}

		const result = await getUserInvites(user.email);
		const count = result.invites.length;

		if (result.error || count === 0) {
			return <>{children}</>;
		}

		return <InviteCountBadge count={count}>{children}</InviteCountBadge>;
	} catch (error) {
		if (!isNoSessionError(error)) await reportError(error);
		return <>{children}</>;
	}
}

export function InviteBadge({ children }: InviteBadgeProps) {
	return (
		<Suspense fallback={children}>
			<InviteBadgeWithData>{children}</InviteBadgeWithData>
		</Suspense>
	);
}
