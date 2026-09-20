/**
 * Shared mock for @mantine/hooks.
 *
 * Usage in a test file:
 *   vi.mock('@mantine/hooks', async () => await import('@mocks/@mantine/hooks'));
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(useDisclosure).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

export const useDisclosure = vi.fn((initialState = false) => [
	initialState,
	{ open: vi.fn(), close: vi.fn(), toggle: vi.fn(), set: vi.fn() },
]);

export const useMediaQuery = vi.fn(() => false);
