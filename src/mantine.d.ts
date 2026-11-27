import type {
	BadgeVariant,
	ButtonVariant,
	ChipVariant,
	InputVariant,
} from '@mantine/core';

type AppButtonVariant =
	| ButtonVariant
	| 'cta'
	| 'dashed'
	| 'white-outline'
	| 'muted'
	| 'on-dark';
type AppBadgeVariant = BadgeVariant | 'ring' | 'tag' | 'tag-plain';
type AppChipVariant = ChipVariant | 'tag';
type AppInputVariant = InputVariant | 'notched';

declare module '@mantine/core' {
	export interface ButtonProps {
		variant?: AppButtonVariant;
	}

	export interface BadgeProps {
		variant?: AppBadgeVariant;
	}

	export interface ChipProps {
		variant?: AppChipVariant;
	}

	export interface InputBaseProps {
		variant?: AppInputVariant;
	}
}
