/**
 * Shared mock for ../../_hooks/useCalendarMeals.
 *
 * Usage in a test file:
 *   vi.mock('../../_hooks/useCalendarMeals', async () =>
 *     await import('#mocks/@app/[planner]/calendar/_hooks/useCalendarMeals')
 *   );
 *
 * Default return value is an empty array. Override in specific tests with:
 *   vi.mocked(useCalendarMeals).mockReturnValue([...])
 *
 * The provider only renders its children.
 */

import { vi } from 'vitest';

import type { ReactNode } from 'react';

import type { CalendarMeal } from '@/app/[planner]/calendar/_components/Calendar';

export const useCalendarMeals = vi.fn((): CalendarMeal[] => []);

export const CalendarDaysProvider = vi.fn(
	({ children }: { children: ReactNode }) => children,
);
