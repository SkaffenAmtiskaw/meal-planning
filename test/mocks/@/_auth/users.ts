/**
 * Shared mock for @/_auth/users.
 *
 * Usage in a test file:
 *   vi.mock('@/_auth/users', async () => await import('#mocks/@/_auth/users'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(findAuthUser).mockResolvedValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

export const findAuthUser = vi.fn(async () => null);
export const changeAuthUserEmail = vi.fn(async () => undefined);
export const addAuthUserPassword = vi.fn(async () => true);
export const linkAuthUserAccount = vi.fn(async () => undefined);
export const deleteAuthUser = vi.fn(async () => undefined);
