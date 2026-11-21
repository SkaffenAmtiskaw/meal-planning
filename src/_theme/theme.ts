/**
 * The theme holds the cta variant's resolver, a function, and the root layout passes the theme to
 * MantineProvider. A server component can't pass a function to a client one, so the theme is client code.
 */
'use client';

import { createTheme, type MantineTheme } from '@mantine/core';

import { CHALK_RAMPS, EMBER_RAMPS, FOREST_RAMPS, NAVY_RAMPS } from './colors';
import navLinkClasses from './NavLink.module.css';

import { variantColorResolver } from './variantColorResolver/variantColorResolver';

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
				},
			}),
		},
		Modal: {
			defaultProps: {
				radius: 'md',
				overlayProps: { blur: 2 },
			},
			vars: () => ({
				root: {
					'--modal-size-xl': '80%',
				},
			}),
		},
		NavLink: {
			classNames: navLinkClasses,
			vars: (theme: MantineTheme) => ({
				root: {
					'--nl-bg': theme.colors.forest[5],
					'--nl-hover': theme.colors.forest[6],
					'--nl-color': theme.white,
				},
			}),
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
			defaultProps: {
				color: 'forest',
			},
		},
	},
});
