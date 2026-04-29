'use client';

import {
	createTheme,
	defaultVariantColorsResolver,
	type MantineTheme,
	type VariantColorsResolver,
} from '@mantine/core';

import { CHALK_RAMPS, EMBER_RAMPS, FOREST_RAMPS, NAVY_RAMPS } from './colors';

const variantColorResolver: VariantColorsResolver = (input) => {
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

export const theme = createTheme({
	fontFamily: 'Inter, sans-serif',
	fontFamilyMonospace: 'JetBrains Mono, monospace',
	primaryColor: 'forest',
	primaryShade: { light: 5, dark: 6 },
	defaultRadius: 'md',
	variantColorResolver,
	colors: {
		ember: EMBER_RAMPS,
		forest: FOREST_RAMPS,
		navy: NAVY_RAMPS,
		chalk: CHALK_RAMPS,
	},
	components: {
		AppShell: {
			styles: {
				header: {
					backgroundColor: '#1C3144',
					borderBottom: 'none',
				},
				navbar: {
					backgroundColor: '#B1BA95',
					borderRight: 'none',
				},
			},
		},
		Button: {
			defaultProps: { radius: 'md' },
		},
		Input: {
			styles: (theme: MantineTheme) => ({
				input: {
					backgroundColor: '#FFFFFF',
					borderColor: '#C8C0C3',
					color: theme.colors.navy[5],
					'&:focus': {
						borderColor: 'rgba(68, 99, 63, 0.4)',
					},
				},
			}),
		},
		InputWrapper: {
			styles: {
				input: {
					'&:focus-within': {
						borderColor: 'rgba(68, 99, 63, 0.4)',
					},
				},
			},
		},
		Modal: {
			defaultProps: {
				radius: 'md',
				overlayProps: { blur: 2 },
			},
		},
		Anchor: {
			defaultProps: {
				c: 'forest',
			},
		},
		Tabs: {
			defaultProps: {
				color: 'forest',
			},
		},
		Text: {
			defaultProps: {
				c: 'navy.5',
			},
		},
		SegmentedControl: {
			styles: {
				label: {
					color: '#44633F',
				},
			},
		},
	},
});
