import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import { renderHook } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useIsMobile } from './useIsMobile';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('@mocks/@mantine/hooks'));

describe('useIsMobile', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(useMantineTheme).mockReturnValue({
			breakpoints: { sm: '48em' },
		} as ReturnType<typeof useMantineTheme>);
	});

	it('calls useMediaQuery with the theme sm breakpoint query', () => {
		renderHook(() => useIsMobile());

		expect(useMediaQuery).toHaveBeenCalledWith('(max-width: 48em)');
	});

	it('returns the value from useMediaQuery', () => {
		vi.mocked(useMediaQuery).mockReturnValueOnce(true);

		const { result } = renderHook(() => useIsMobile());

		expect(result.current).toBe(true);
	});
});
