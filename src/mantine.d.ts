import type { BadgeVariant, ButtonVariant } from '@mantine/core';

type AppButtonVariant = ButtonVariant | 'cta' | 'dashed';
type RingBadgeVariant = BadgeVariant | 'ring';

declare module '@mantine/core' {
	export interface ButtonProps {
		variant?: AppButtonVariant;
	}

	export interface BadgeProps {
		variant?: RingBadgeVariant;
	}
}
