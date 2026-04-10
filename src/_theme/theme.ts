'use client';

import Link from 'next/link';

import { createTheme, NavLink } from '@mantine/core';

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
		NavLink: NavLink.extend({
			defaultProps: {
				component: Link,
			},
			styles: () => ({
				root: {
					color: '#EFE7E9',
					'&[data-active]': {
						backgroundColor: '#44633F',
						color: '#EFE7E9',
					},
					'&:hover': {
						backgroundColor: 'rgba(255, 255, 255, 0.08)',
					},
				},
				label: { fontWeight: 500 },
			}),
		}),
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
		Tabs: {
			styles: () => ({
				tab: {
					'&[data-active]': {
						borderColor: '#FF6542',
						color: '#1C3144',
					},
				},
			}),
		},
		Modal: {
			defaultProps: {
				radius: 'md',
				overlayProps: { blur: 2 },
			},
		},
	},
});
