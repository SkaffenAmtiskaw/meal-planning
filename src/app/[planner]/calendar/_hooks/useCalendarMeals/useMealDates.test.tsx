import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import type { ReactNode } from 'react';

import type { DayInterface } from '@/_models/types';

import { CalendarDaysProvider } from './CalendarDaysProvider';
import { useMealDates } from './useMealDates';

function renderMealDates(calendar: DayInterface[]) {
	return renderHook(() => useMealDates(), {
		wrapper: ({ children }: { children: ReactNode }) => (
			<CalendarDaysProvider calendar={calendar}>
				{children}
			</CalendarDaysProvider>
		),
	});
}

describe('useMealDates', () => {
	test('lists the days with at least one meal', () => {
		const { result } = renderMealDates([
			{
				date: '2024-01-01',
				meals: [{ _id: 'meal-1', name: 'Dinner', dishes: [] }],
			},
			{
				date: '2024-01-03',
				meals: [
					{ _id: 'meal-2', name: 'Lunch', dishes: [] },
					{ _id: 'meal-3', name: 'Dinner', dishes: [] },
				],
			},
		]);

		expect(result.current).toEqual(['2024-01-01', '2024-01-03']);
	});

	test('skips days whose meals were all removed', () => {
		const { result } = renderMealDates([
			{ date: '2024-01-01', meals: [] },
			{
				date: '2024-01-02',
				meals: [{ _id: 'meal-1', name: 'Dinner', dishes: [] }],
			},
		]);

		expect(result.current).toEqual(['2024-01-02']);
	});

	test('lists no days for an empty calendar', () => {
		const { result } = renderMealDates([]);

		expect(result.current).toEqual([]);
	});
});
