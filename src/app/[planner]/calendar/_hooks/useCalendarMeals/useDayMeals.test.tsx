import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ReactNode } from 'react';

import { DateTime } from 'luxon';

import type { SavedItem } from '@/_actions/library/types';
import type { DayInterface } from '@/_models/types';

import { CalendarDaysProvider } from './CalendarDaysProvider';
import { useDayMeals } from './useDayMeals';

import { usePlannerSavedItems } from '../usePlannerSavedItems';
import type { CalendarMeal } from '../../_components/Calendar';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';

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

const june15: DayInterface = {
	date: '2024-06-15',
	meals: [{ _id: 'meal-1', name: 'Dinner', dishes: [] }],
};
const june16: DayInterface = {
	date: '2024-06-16',
	meals: [{ _id: 'meal-2', name: 'Lunch', dishes: [] }],
};

const savedItems: SavedItem[] = [
	{ _id: 'item-1', name: 'Pancakes', kind: 'recipe', tags: [] },
];

const meals: CalendarMeal[] = [
	{
		id: 'meal-1',
		date: '2024-06-15',
		name: 'Dinner',
		borderColor: '#000',
		dishes: [],
	},
];

function renderDayMeals(date: DateTime) {
	return renderHook(() => useDayMeals(date), {
		wrapper: ({ children }: { children: ReactNode }) => (
			<CalendarDaysProvider calendar={[june15, june16]}>
				{children}
			</CalendarDaysProvider>
		),
	});
}

describe('useDayMeals', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(usePlannerSavedItems).mockReturnValue(savedItems);
		vi.mocked(toCalendarMeals).mockReturnValue(meals);
	});

	test("builds the meals from that day alone, with the planner's saved items", () => {
		const { result } = renderDayMeals(DateTime.local(2024, 6, 15));

		expect(toCalendarMeals).toHaveBeenCalledWith([june15], savedItems);
		expect(result.current).toBe(meals);
	});

	test('gives no meals for a day the calendar has no entry for', () => {
		const { result } = renderDayMeals(DateTime.local(2024, 6, 20));

		expect(toCalendarMeals).not.toHaveBeenCalled();
		expect(result.current).toEqual([]);
	});

	test('throws outside the provider', () => {
		expect(() =>
			renderHook(() => useDayMeals(DateTime.local(2024, 6, 15))),
		).toThrow('useCalendarDays must be used inside CalendarDaysProvider');
	});
});
