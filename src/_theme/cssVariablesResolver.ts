/**
 * The root layout passes this resolver to MantineProvider, and a server component can't pass a
 * function to a client one, so it's client code like the theme.
 */
'use client';

import type { CSSVariablesResolver } from '@mantine/core';

import { MUTED_TEXT } from './colors';

/**
 * `--ring-width` is the width of the navy ring that marks today. `NumberMark` and the `ring` badge
 * variant both read it, so the two rings match. `--text-muted` is the color of muted text, such as
 * a section label, for a `c` prop or a CSS module. `--selected-fill` is the soft sage fill behind a
 * selected or current piece of content, such as the selected day's number and the dish being
 * linked in the meal form, so every such fill matches.
 */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
	variables: {
		'--ring-width': '1.5px',
		'--text-muted': MUTED_TEXT,
		'--selected-fill':
			'color-mix(in srgb, var(--mantine-color-sage-5) 45%, transparent)',
	},
	light: {},
	dark: {},
});
