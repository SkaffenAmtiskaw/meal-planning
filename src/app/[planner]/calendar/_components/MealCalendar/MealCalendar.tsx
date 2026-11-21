'use client';

import { useCallback, useMemo } from 'react';

import type { DayInterface } from '@/_models/types';

import { MonthMealCard } from './MonthMealCard';

import { MonthGrid } from '../Calendar';
import { useCalendarModal } from '../CalendarModal';
import type { CalendarMeal, MonthGridMeal, MonthGridProps } from '../Calendar';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';
import type { SavedItem } from '../../types';

interface MealCalendarProps {
	calendar: DayInterface[];
	savedItems?: SavedItem[];
}

export function MealCalendar({ calendar, savedItems }: MealCalendarProps) {
	const { open } = useCalendarModal();

	const meals = useMemo(
		() => toCalendarMeals(calendar, savedItems),
		[calendar, savedItems],
	);

	const mealMap = useMemo(
		() => new Map(meals.map((meal) => [meal.id, meal])),
		[meals],
	);

	const openMeal = useCallback(
		(meal: CalendarMeal) => open('meal_detail', { meal }),
		[open],
	);

	const handleMealClick = useCallback(
		(meal: MonthGridMeal) => {
			const calendarMeal = mealMap.get(meal.id);
			if (calendarMeal) {
				openMeal(calendarMeal);
			}
		},
		[mealMap, openMeal],
	);

	const renderMeal = useCallback(
		(
			meal: MonthGridMeal,
			props: Parameters<NonNullable<MonthGridProps['renderMeal']>>[1],
		) => {
			const calendarMeal = mealMap.get(meal.id);
			if (!calendarMeal) return null;

			return (
				<MonthMealCard
					meal={meal}
					tabIndex={props.tabIndex}
					ref={props.ref}
					onClick={() => {
						openMeal(calendarMeal);
					}}
				/>
			);
		},
		[mealMap, openMeal],
	);

	return (
		<MonthGrid
			meals={meals}
			renderMeal={renderMeal}
			onMealClick={handleMealClick}
		/>
	);
}
