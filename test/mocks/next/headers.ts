/**
 * Shared mock for next/headers.
 *
 * Usage in a test file:
 *
 *   vi.mock('next/headers', async () => await import('@mocks/next/headers'));
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(cookies).mockResolvedValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

export const cookies = vi.fn(() =>
	Promise.resolve({
		get: vi.fn(),
	}),
);

export const headers = vi.fn(() => Promise.resolve(new Headers()));
