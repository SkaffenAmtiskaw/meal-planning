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
import { toCalendarMeals } from '../../_utils/toCalendarMeals';
import type { SavedItem } from '../../types';

interface MealWeekViewProps {
	calendar: DayInterface[];
	savedItems?: SavedItem[];
	plannerId: string;
	onMealClick?: (meal: CalendarMeal) => void;
}

export function MealWeekView({
	calendar,
	savedItems,
	plannerId,
	onMealClick,
}: MealWeekViewProps) {
	const meals = useMemo(
		() => toCalendarMeals(calendar, savedItems),
		[calendar, savedItems],
	);

	const { weekMeals, mealMap } = useMemo(() => {
		const weekMeals: WeekViewMeal[] = meals.map((meal) => ({
			id: meal.id,
			date: meal.date,
			name: meal.name,
			description: meal.description,
		}));

		const mealMap = new Map<string, CalendarMeal>();
		for (const meal of meals) {
			mealMap.set(meal.id, meal);
		}

		return { weekMeals, mealMap };
	}, [meals]);

	const handleMealClick = useCallback(
		(meal: WeekViewMeal) => {
			const calendarEvent = mealMap.get(meal.id);
			if (calendarEvent) {
				onMealClick?.(calendarEvent);
			}
		},
		[mealMap, onMealClick],
	);

	const renderMeal = useCallback(
		(
			meal: WeekViewMeal,
			props: Parameters<NonNullable<WeekViewProps['renderMeal']>>[1],
		) => {
			const calendarEvent = mealMap.get(meal.id);
			if (!calendarEvent) return null;

			return (
				<WeekMealCard
					event={calendarEvent}
					plannerId={plannerId}
					onClick={() => onMealClick?.(calendarEvent)}
					tabIndex={props.tabIndex}
					ref={props.ref}
				/>
			);
		},
		[mealMap, onMealClick, plannerId],
	);

	return (
		<WeekView
			meals={weekMeals}
			renderMeal={renderMeal}
			onMealClick={handleMealClick}
		/>
	);
}
