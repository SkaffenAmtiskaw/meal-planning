import type { BadgeVariant, ButtonVariant } from '@mantine/core';

type CtaButtonVariant = ButtonVariant | 'cta';
type RingBadgeVariant = BadgeVariant | 'ring';

declare module '@mantine/core' {
	export interface ButtonProps {
		variant?: CtaButtonVariant;
	}

	export interface BadgeProps {
		variant?: RingBadgeVariant;
	}
}
