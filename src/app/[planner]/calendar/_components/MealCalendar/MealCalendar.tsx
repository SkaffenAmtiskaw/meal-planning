'use client';

import { useCallback, useMemo } from 'react';

import type { DayInterface } from '@/_models/types';

import { MonthMealCard } from './MonthMealCard';

import { MonthGrid } from '../Calendar';
import type { CalendarMeal, MonthGridMeal, MonthGridProps } from '../Calendar';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';
import type { SavedItem } from '../../types';

interface MealCalendarProps {
	calendar: DayInterface[];
	savedItems?: SavedItem[];
	onMealClick?: (meal: CalendarMeal) => void;
}

export function MealCalendar({
	calendar,
	savedItems,
	onMealClick,
}: MealCalendarProps) {
	const meals = useMemo(
		() => toCalendarMeals(calendar, savedItems),
		[calendar, savedItems],
	);

	const mealMap = useMemo(
		() => new Map(meals.map((meal) => [meal.id, meal])),
		[meals],
	);

	const handleMealClick = useCallback(
		(meal: MonthGridMeal) => {
			const calendarMeal = mealMap.get(meal.id);
			if (calendarMeal) {
				onMealClick?.(calendarMeal);
			}
		},
		[mealMap, onMealClick],
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
						onMealClick?.(calendarMeal);
					}}
				/>
			);
		},
		[mealMap, onMealClick],
	);

	return (
		<MonthGrid
			meals={meals}
			renderMeal={renderMeal}
			onMealClick={handleMealClick}
		/>
	);
}
