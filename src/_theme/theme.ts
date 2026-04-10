'use client';

import { createTheme } from '@mantine/core';

import { EMBER_RAMPS, NAVY_RAMPS } from './colors';

export const theme = createTheme({
	fontFamily: 'Inter, sans-serif',
	fontFamilyMonospace: 'JetBrains Mono, monospace',
	primaryColor: 'ember',
	primaryShade: { light: 5, dark: 6 },
	defaultRadius: 'md',
	colors: {
		ember: EMBER_RAMPS,
		navy: NAVY_RAMPS,
	},
	components: {
		AppShell: {
			styles: {
				header: {
					backgroundColor: '#1C3144',
					borderBottom: 'none',
				},
				navbar: {
					backgroundColor: '#1C3144',
					borderRight: 'none',
				},
			},
		},
		Button: {
			defaultProps: { radius: 'md' },
		},
		Input: {
			styles: {
				input: {
					backgroundColor: '#FFFFFF',
					borderColor: '#C8C0C3',
				},
			},
		},
		Modal: {
			defaultProps: {
				radius: 'md',
				overlayProps: { blur: 2 },
			},
		},
	},
});
