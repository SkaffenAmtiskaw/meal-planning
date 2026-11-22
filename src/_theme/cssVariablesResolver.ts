/**
 * The root layout passes this resolver to MantineProvider, and a server component can't pass a
 * function to a client one, so it's client code like the theme.
 */
'use client';

import type { CSSVariablesResolver } from '@mantine/core';

/**
 * `--ring-width` is the width of the navy ring that marks today. `NumberMark` and the `ring` badge
 * variant both read it, so the two rings match.
 */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
	variables: { '--ring-width': '1.5px' },
	light: {},
	dark: {},
});
