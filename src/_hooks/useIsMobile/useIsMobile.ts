'use client';

import { useContext } from 'react';

import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import { MobileGuessContext } from './MobileGuessProvider';

/**
 * Whether the window is below Mantine's `sm` breakpoint. It starts from the
 * server's guess, so the browser's first render matches the server's, then
 * follows the window once the browser measures it.
 */
export function useIsMobile(): boolean {
	const theme = useMantineTheme();
	const guess = useContext(MobileGuessContext);

	return useMediaQuery(`(max-width: ${theme.breakpoints.sm})`, guess);
}
