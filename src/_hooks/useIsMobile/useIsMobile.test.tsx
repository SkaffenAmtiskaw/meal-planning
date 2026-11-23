import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ReactNode } from 'react';

import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import { MobileGuessProvider } from './MobileGuessProvider';
import { useIsMobile } from './useIsMobile';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('#mocks/@mantine/hooks'));

const guessing =
	(isMobile: boolean) =>
	({ children }: { children: ReactNode }) => (
		<MobileGuessProvider isMobile={isMobile}>{children}</MobileGuessProvider>
	);

describe('useIsMobile', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(useMantineTheme).mockReturnValue({
			breakpoints: { sm: '48em' },
		} as ReturnType<typeof useMantineTheme>);
	});

	it("starts from the server's phone guess until the window is measured", () => {
		renderHook(() => useIsMobile(), { wrapper: guessing(true) });

		expect(useMediaQuery).toHaveBeenCalledWith('(max-width: 48em)', true);
	});

	it('starts from desktop when the server guessed nothing', () => {
		renderHook(() => useIsMobile());

		expect(useMediaQuery).toHaveBeenCalledWith('(max-width: 48em)', false);
	});

	it('returns the value from useMediaQuery', () => {
		vi.mocked(useMediaQuery).mockReturnValueOnce(true);

		const { result } = renderHook(() => useIsMobile(), {
			wrapper: guessing(false),
		});

		expect(result.current).toBe(true);
	});
});
