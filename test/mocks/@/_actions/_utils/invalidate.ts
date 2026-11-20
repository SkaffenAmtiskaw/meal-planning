/**
 * Shared mock for @/_actions/_utils/invalidate.
 *
 * Usage in a test file:
 *   vi.mock('@/_actions/_utils/invalidate', async () => await import('#mocks/@/_actions/_utils/invalidate'))
 *
 * The real module calls next/cache, which needs a request, so every test of a
 * mutation mocks it.
 */

import { vi } from 'vitest';

export const invalidate = vi.fn();
