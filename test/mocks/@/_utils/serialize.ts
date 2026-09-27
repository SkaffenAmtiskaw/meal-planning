/**
 * Shared mock for @/_utils/serialize.
 *
 * Usage in a test file:
 *   vi.mock('@/_utils/serialize', async () => await import('@mocks/@/_utils/serialize'));
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(serialize).mockReturnValueOnce(...)` to override for a single test.
 */

import { vi } from 'vitest';

export const serialize = vi.fn((data) => data);
