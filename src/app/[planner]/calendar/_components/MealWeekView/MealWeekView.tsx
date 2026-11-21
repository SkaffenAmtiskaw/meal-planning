'use client';

import { useCallback, useMemo } from 'react';

import type { DayInterface } from '@/_models/types';

import { WeekMealCard } from './WeekMealCard';

import {
	type CalendarMeal,
	WeekView,
	type WeekViewMeal,
	type WeekViewProps,
} from '../Calendar';
import { useCalendarModal } from '../CalendarModal';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';
import type { SavedItem } from '../../types';

interface MealWeekViewProps {
	calendar: DayInterface[];
	savedItems?: SavedItem[];
	plannerId: string;
}

export function MealWeekView({
	calendar,
	savedItems,
	plannerId,
}: MealWeekViewProps) {
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
		(meal: WeekViewMeal) => {
			const calendarMeal = mealMap.get(meal.id);
			if (calendarMeal) {
				openMeal(calendarMeal);
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
					onClick={() => openMeal(calendarMeal)}
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
