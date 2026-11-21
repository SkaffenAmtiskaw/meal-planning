import { Indicator } from '@mantine/core';

interface InviteCountBadgeProps {
	count: number;
	children: React.ReactNode;
}

export function InviteCountBadge({ count, children }: InviteCountBadgeProps) {
	return (
		<Indicator
			data-testid="invite-badge"
			color="ember"
			size={16}
			label={count}
			maxValue={99}
			inline
		>
			{children}
		</Indicator>
	);
}
