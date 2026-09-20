'use client';

import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export function useIsMobile(): boolean {
	const theme = useMantineTheme();

	return useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
}
