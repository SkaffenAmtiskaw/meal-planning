import type { BadgeVariant, ButtonVariant } from '@mantine/core';

type AppButtonVariant =
	| ButtonVariant
	| 'cta'
	| 'dashed'
	| 'white-outline'
	| 'muted';
type AppBadgeVariant = BadgeVariant | 'ring' | 'tag' | 'tag-plain';

declare module '@mantine/core' {
	export interface ButtonProps {
		variant?: AppButtonVariant;
	}

	export interface BadgeProps {
		variant?: AppBadgeVariant;
	}
}
