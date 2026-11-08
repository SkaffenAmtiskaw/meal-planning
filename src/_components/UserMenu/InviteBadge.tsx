import 'server-only';

import { Suspense } from 'react';

import { Indicator } from '@mantine/core';

import { getUserInvites } from '@/_actions/sharing/getUserInvites';
import { getUser } from '@/_actions/user';
import { THEME_COLORS } from '@/_theme/colors';
import { reportError } from '@/_utils/reportError';

export interface InviteBadgeProps {
	children: React.ReactNode;
}

// Async server component that fetches data - exported for testing
export async function InviteBadgeWithData({ children }: InviteBadgeProps) {
	try {
		const user = await getUser();
		const email = user?.email;

		if (!email) {
			return <>{children}</>;
		}

		const result = await getUserInvites(email);

		if (result.error) {
			return <>{children}</>;
		}

		const count = result.invites.length;

		if (count === 0) {
			return <>{children}</>;
		}

		return (
			<Indicator
				data-testid="invite-badge"
				color={THEME_COLORS.ember}
				size={16}
				label={count}
				maxValue={99}
				inline
				showZero={false}
			>
				{children}
			</Indicator>
		);
	} catch (error) {
		// getUser throws 'No Valid Session' for a signed-out visitor, which is expected
		if (!(error instanceof Error && error.message === 'No Valid Session')) {
			await reportError(error);
		}
		return <>{children}</>;
	}
}

// Main component with Suspense
export function InviteBadge({ children }: InviteBadgeProps) {
	return (
		<Suspense fallback={children}>
			<InviteBadgeWithData>{children}</InviteBadgeWithData>
		</Suspense>
	);
}
