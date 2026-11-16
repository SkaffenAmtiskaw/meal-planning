/**
 * Shared mock for @/_models/database/newId.
 *
 * Usage in a test file:
 *   vi.mock('@/_models/database/newId', async () => await import('#mocks/@/_models/database/newId'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(newId).mockReturnValueOnce(...)` to give each new document its own id in one test.
 */

import { vi } from 'vitest';

export const newId = vi.fn(() => 'new-id');
