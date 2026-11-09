/**
 * Shared mock for @/_actions/auth.
 *
 * Usage in a test file:
 *   vi.mock('@/_actions/auth', async () => await import('#mocks/@/_actions/auth'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(checkEmailStatus).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

export const checkEmailStatus = vi.fn(async () => 'new' as const);
