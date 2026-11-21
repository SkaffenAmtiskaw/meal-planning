import { Indicator } from '@mantine/core';

import { THEME_COLORS } from '@/_theme/colors';

interface InviteCountBadgeProps {
	count: number;
	children: React.ReactNode;
}

export function InviteCountBadge({ count, children }: InviteCountBadgeProps) {
	return (
		<Indicator
			data-testid="invite-badge"
			color={THEME_COLORS.ember}
			size={16}
			label={count}
			maxValue={99}
			inline
		>
			{children}
		</Indicator>
	);
}
