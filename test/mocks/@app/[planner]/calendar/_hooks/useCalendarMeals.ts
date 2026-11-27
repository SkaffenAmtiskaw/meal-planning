/**
 * Shared mock for ../../_hooks/useCalendarMeals.
 *
 * Usage in a test file:
 *   vi.mock('../../_hooks/useCalendarMeals', async () =>
 *     await import('#mocks/@app/[planner]/calendar/_hooks/useCalendarMeals')
 *   );
 *
 * `useCalendarMeals`, `useDayMeals` and `useMealDates` return an empty array
 * by default. Override in specific tests with:
 *   vi.mocked(useCalendarMeals).mockReturnValue([...])
 *   vi.mocked(useDayMeals).mockReturnValue([...])
 *   vi.mocked(useMealDates).mockReturnValue(['2024-06-12'])
 *
 * The provider only renders its children.
 */

import { vi } from 'vitest';

import type { ReactNode } from 'react';

import type { CalendarMeal } from '@/app/[planner]/calendar/_components/Calendar';

export const useCalendarMeals = vi.fn((): CalendarMeal[] => []);

export const useDayMeals = vi.fn((): CalendarMeal[] => []);

export const useMealDates = vi.fn((): string[] => []);

export const CalendarDaysProvider = vi.fn(
	({ children }: { children: ReactNode }) => children,
);
