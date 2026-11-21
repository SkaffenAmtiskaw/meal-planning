import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ReactNode } from 'react';

import type { DayInterface } from '@/_models/types';

import { CalendarDaysProvider } from './CalendarDaysProvider';
import { useCalendarMeals } from './useCalendarMeals';

import { usePlannerSavedItems } from '../usePlannerSavedItems';
import type { CalendarMeal } from '../../_components/Calendar';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';
import type { SavedItem } from '../../types';

vi.mock(
	'../usePlannerSavedItems',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/usePlannerSavedItems'),
);
vi.mock(
	'../../_utils/toCalendarMeals',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_utils/toCalendarMeals'),
);

const calendar: DayInterface[] = [
	{
		date: '2024-01-01',
		meals: [{ _id: 'meal-1', name: 'Dinner', dishes: [] }],
	},
];

const savedItems: SavedItem[] = [{ _id: 'item-1', name: 'Pancakes' }];

const meals: CalendarMeal[] = [
	{
		id: 'meal-1',
		date: '2024-01-01',
		name: 'Dinner',
		borderColor: '#000',
		dishes: [],
	},
];

const wrapper = ({ children }: { children: ReactNode }) => (
	<CalendarDaysProvider calendar={calendar}>{children}</CalendarDaysProvider>
);

describe('useCalendarMeals', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(usePlannerSavedItems).mockReturnValue(savedItems);
		vi.mocked(toCalendarMeals).mockReturnValue(meals);
	});

	test("builds the meals from the provider's days and the planner's saved items", () => {
		const { result } = renderHook(() => useCalendarMeals(), { wrapper });

		expect(toCalendarMeals).toHaveBeenCalledWith(calendar, savedItems);
		expect(result.current).toBe(meals);
	});

	test('throws outside the provider', () => {
		expect(() => renderHook(() => useCalendarMeals())).toThrow(
			'useCalendarMeals must be used inside CalendarDaysProvider',
		);
	});
});
