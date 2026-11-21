'use client';

import { useCallback, useMemo } from 'react';

import { MonthMealCard } from './MonthMealCard';

import { MonthGrid } from '../Calendar';
import { useCalendarModal } from '../CalendarModal';
import type { MonthGridMeal, MonthGridProps } from '../Calendar';
import { useCalendarMeals } from '../../_hooks/useCalendarMeals';

export function MealCalendar() {
	const { open } = useCalendarModal();
	const meals = useCalendarMeals();

	const mealIds = useMemo(() => new Set(meals.map((meal) => meal.id)), [meals]);

	const openMeal = useCallback(
		(mealId: string) => open('meal_detail', { mealId }),
		[open],
	);

	const handleMealClick = useCallback(
		(meal: MonthGridMeal) => {
			if (mealIds.has(meal.id)) {
				openMeal(meal.id);
			}
		},
		[mealIds, openMeal],
	);

	const renderMeal = useCallback(
		(
			meal: MonthGridMeal,
			props: Parameters<NonNullable<MonthGridProps['renderMeal']>>[1],
		) => {
			if (!mealIds.has(meal.id)) return null;

			return (
				<MonthMealCard
					meal={meal}
					tabIndex={props.tabIndex}
					ref={props.ref}
					onClick={() => openMeal(meal.id)}
				/>
			);
		},
		[mealIds, openMeal],
	);

	return (
		<MonthGrid
			meals={meals}
			renderMeal={renderMeal}
			onMealClick={handleMealClick}
		/>
	);
}
