/**
 * Shared mock for the calendar's _components/_utils/isBlankDish.
 *
 * Usage in a test file:
 *   vi.mock('../../_utils/isBlankDish', async () =>
 *     await import('#mocks/@app/[planner]/calendar/_components/_utils/isBlankDish')
 *   );
 *
 * By default no dish is blank. Override in specific tests with:
 *   vi.mocked(isBlankDish).mockReturnValueOnce(true)
 */

import { vi } from 'vitest';

export const isBlankDish = vi.fn(() => false);
