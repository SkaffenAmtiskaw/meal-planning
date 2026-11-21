/**
 * Shared mock for ../../_hooks/useCalendarDays.
 *
 * Usage in a test file:
 *   vi.mock('../../_hooks/useCalendarDays', async () =>
 *     await import('#mocks/@app/[planner]/calendar/_hooks/useCalendarDays')
 *   );
 *
 * Default return value is an empty array. Override in specific tests with:
 *   vi.mocked(useCalendarDays).mockReturnValue([...])
 *
 * The provider only renders its children.
 */

import { vi } from 'vitest';

import type { ReactNode } from 'react';

import type { DayInterface } from '@/_models/types';

export const useCalendarDays = vi.fn((): DayInterface[] => []);

export const CalendarDaysProvider = vi.fn(
	({ children }: { children: ReactNode }) => children,
);
