/**
 * The theme holds the cta variant's resolver, a function, and the root layout passes the theme to
 * MantineProvider. A server component can't pass a function to a client one, so the theme is client code.
 */
'use client';

import { createTheme, type MantineTheme } from '@mantine/core';

import {
	CHALK_RAMPS,
	EMBER_RAMPS,
	FOREST_RAMPS,
	INPUT_BORDER,
	NAVY_RAMPS,
	SAGE,
} from './colors';

import { indicatorDefaults } from './components/Indicator/Indicator';
import { navLinkDefaults } from './components/NavLink/NavLink';
import { variantColorResolver } from './variantColorResolver/variantColorResolver';

export const theme = createTheme({
	fontFamily: 'Inter, sans-serif',
	fontFamilyMonospace: 'JetBrains Mono, monospace',
	primaryColor: 'navy',
	primaryShade: 5,
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
			styles: (theme: MantineTheme) => ({
				header: {
					backgroundColor: theme.colors.navy[5],
					borderBottom: 'none',
				},
				navbar: {
					backgroundColor: SAGE,
					borderRight: 'none',
				},
			}),
		},
		Input: {
			styles: (theme: MantineTheme) => ({
				input: {
					backgroundColor: theme.white,
					borderColor: INPUT_BORDER,
					color: theme.colors.navy[5],
				},
			}),
		},
		Indicator: indicatorDefaults,
		Modal: {
			defaultProps: {
				overlayProps: { blur: 2 },
			},
			vars: () => ({
				root: {
					'--modal-size-xl': '80%',
				},
			}),
		},
		NavLink: navLinkDefaults,
		Anchor: {
			// Links and text are both navy, so the underline is what marks a link.
			defaultProps: {
				underline: 'always',
			},
		},
		Text: {
			defaultProps: {
				c: 'navy.5',
			},
		},
		SegmentedControl: {
			/**
			 * Without a color, the selected option is a white pill with black text. Mantine's
			 * grey track and labels stay.
			 */
			defaultProps: (theme: MantineTheme) => ({
				color: theme.primaryColor,
			}),
		},
	},
});
