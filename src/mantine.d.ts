import type { ButtonVariant } from '@mantine/core';

type CtaButtonVariant = ButtonVariant | 'cta';

declare module '@mantine/core' {
	export interface ButtonProps {
		variant?: CtaButtonVariant;
	}
}
