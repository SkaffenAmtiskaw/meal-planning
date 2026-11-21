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

	return defaultResolvedColors;
};
