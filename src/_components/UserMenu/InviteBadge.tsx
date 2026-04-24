import 'server-only';

import { Suspense } from 'react';

import { Indicator } from '@mantine/core';

import { getUserInvites } from '@/_actions/planner/getUserInvites';
import { getUser } from '@/_actions/user/getUser';
import { THEME_COLORS } from '@/_theme/colors';

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
		console.error('InviteBadge: Exception:', error);
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
