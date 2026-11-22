import {
	defaultVariantColorsResolver,
	type VariantColorsResolver,
} from '@mantine/core';

export const variantColorResolver: VariantColorsResolver = (input) => {
	const defaultResolvedColors = defaultVariantColorsResolver(input);

	if (input.variant === 'cta') {
		return {
			...defaultResolvedColors,
			background: input.theme.colors.ember[5],
			hover: input.theme.colors.ember[6],
			color: input.theme.white,
			border: 'none',
		};
	}

	if (input.variant === 'ring') {
		return {
			...defaultResolvedColors,
			background: 'transparent',
			hover: 'transparent',
			color: input.theme.colors.navy[5],
			border: `var(--ring-width) solid ${input.theme.colors.navy[5]}`,
		};
	}

	return defaultResolvedColors;
};
