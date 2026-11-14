/**
 * Shared mock for @/_utils/reportError.
 *
 * Usage in a test file:
 *   vi.mock('@/_utils/reportError', async () => await import('#mocks/@/_utils/reportError'));
 *
 * Assert with `expect(reportError).toHaveBeenCalledWith(error)` for an unexpected failure, and
 * `expect(reportError).not.toHaveBeenCalled()` for an expected one.
 */

import { vi } from 'vitest';

export const reportError = vi.fn(async (_error: unknown) => {});
