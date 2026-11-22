import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import type { ReactNode } from 'react';

import type { DayInterface } from '@/_models/types';

import { CalendarDaysProvider } from './CalendarDaysProvider';
import { useCalendarDays } from './useCalendarDays';

const calendar: DayInterface[] = [{ date: '2024-01-01', meals: [] }];

describe('useCalendarDays', () => {
	test("returns the provider's days", () => {
		const { result } = renderHook(() => useCalendarDays(), {
			wrapper: ({ children }: { children: ReactNode }) => (
				<CalendarDaysProvider calendar={calendar}>
					{children}
				</CalendarDaysProvider>
			),
		});

		expect(result.current).toBe(calendar);
	});

	test('throws outside the provider', () => {
		expect(() => renderHook(() => useCalendarDays())).toThrow(
			'useCalendarDays must be used inside CalendarDaysProvider',
		);
	});
});
