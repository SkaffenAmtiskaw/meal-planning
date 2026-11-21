'use client';

import { useCallback, useMemo } from 'react';

import { WeekMealCard } from './WeekMealCard';

import { WeekView, type WeekViewMeal, type WeekViewProps } from '../Calendar';
import { useCalendarModal } from '../CalendarModal';
import { useCalendarMeals } from '../../_hooks/useCalendarMeals';

interface MealWeekViewProps {
	plannerId: string;
}

export function MealWeekView({ plannerId }: MealWeekViewProps) {
	const { open } = useCalendarModal();
	const meals = useCalendarMeals();

	const mealMap = useMemo(
		() => new Map(meals.map((meal) => [meal.id, meal])),
		[meals],
	);

	const openMeal = useCallback(
		(mealId: string) => open('meal_detail', { mealId }),
		[open],
	);

	const handleMealClick = useCallback(
		(meal: WeekViewMeal) => {
			if (mealMap.has(meal.id)) {
				openMeal(meal.id);
			}
		},
		[mealMap, openMeal],
	);

	const renderMeal = useCallback(
		(
			meal: WeekViewMeal,
			props: Parameters<NonNullable<WeekViewProps['renderMeal']>>[1],
		) => {
			const calendarMeal = mealMap.get(meal.id);
			if (!calendarMeal) return null;

			return (
				<WeekMealCard
					meal={calendarMeal}
					plannerId={plannerId}
					onClick={() => openMeal(calendarMeal.id)}
					tabIndex={props.tabIndex}
					ref={props.ref}
				/>
			);
		},
		[mealMap, openMeal, plannerId],
	);

	return (
		<WeekView
			meals={meals}
			renderMeal={renderMeal}
			onMealClick={handleMealClick}
		/>
	);
}
