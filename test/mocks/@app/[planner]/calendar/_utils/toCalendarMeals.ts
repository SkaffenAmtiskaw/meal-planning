/**
 * Shared mock for ../../_utils/toCalendarMeals.
 *
 * Usage in a test file:
 *   vi.mock('../../_utils/toCalendarMeals', async () =>
 *     await import('#mocks/@app/[planner]/calendar/_utils/toCalendarMeals')
 *   );
 *
 * Default return value is an empty array. Override in specific tests with:
 *   vi.mocked(toCalendarMeals).mockReturnValue([...])
 */

import { vi } from 'vitest';

import type { CalendarMeal } from '@/app/[planner]/calendar/_components/Calendar';

export const toCalendarMeals = vi.fn((): CalendarMeal[] => []);
