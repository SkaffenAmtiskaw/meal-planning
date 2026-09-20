/**
 * Shared mock for @/_actions/calendar.
 *
 * Usage in a test file:
 *   vi.mock('@/_actions/calendar', async () => await import('@mocks/@/_actions/calendar'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(addMeal).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

export const addMeal = vi.fn(async () => ({
	ok: true as const,
	data: { calendar: [] },
}));
