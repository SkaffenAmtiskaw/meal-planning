import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import type { ReactNode } from 'react';

import type { DayInterface } from '@/_models/types';

import { CalendarDaysProvider } from './CalendarDaysProvider';
import { useCalendarDays } from './useCalendarDays';

const calendar: DayInterface[] = [
	{
		date: '2024-01-01',
		meals: [{ _id: 'meal-1', name: 'Dinner', dishes: [] }],
	},
];

const wrapper = ({ children }: { children: ReactNode }) => (
	<CalendarDaysProvider calendar={calendar}>{children}</CalendarDaysProvider>
);

describe('useCalendarDays', () => {
	test('returns the days the provider is given', () => {
		const { result } = renderHook(() => useCalendarDays(), { wrapper });

		expect(result.current).toBe(calendar);
	});

	test('throws outside the provider', () => {
		expect(() => renderHook(() => useCalendarDays())).toThrow(
			'useCalendarDays must be used inside CalendarDaysProvider',
		);
	});
});
