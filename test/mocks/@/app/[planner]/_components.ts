/**
 * Shared mock for @/app/[planner]/_components.
 *
 * Usage in a test file:
 *   vi.mock('@/app/[planner]/_components', async () => await import('#mocks/@/app/[planner]/_components'))
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(useCanWrite).mockReturnValue(false)` to test a read-only member.
 */

import { vi } from 'vitest';

export const useCanWrite = vi.fn(() => true);
