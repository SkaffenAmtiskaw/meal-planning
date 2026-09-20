'use client';

import { useCallback, useMemo } from 'react';

import type { MonthGridMeal, MonthGridProps } from '@/_components/Calendar';
import { MonthGrid } from '@/_components/Calendar';

import { MealEventCard } from './MealEventCard';

import type { CalendarEvent } from '../../_utils/toCalendarEvents';
import { toCalendarEvents } from '../../_utils/toCalendarEvents';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';

export interface MealCalendarProps {
	calendar: SerializedDay[];
	savedItems?: SavedItem[];
	onMealClick?: (meal: CalendarEvent) => void;
}

export function MealCalendar({
	calendar,
	savedItems,
	onMealClick,
}: MealCalendarProps) {
	const meals = useMemo(
		() => toCalendarEvents(calendar, savedItems),
		[calendar, savedItems],
	);

	const { monthGridMeals, mealMap } = useMemo(() => {
		const monthGridMeals: MonthGridMeal[] = meals.map((meal) => ({
			id: meal.id,
			date: meal.start,
			title: meal.title,
			description: meal.description,
		}));

		const mealMap = new Map<string, CalendarEvent>();
		for (const meal of meals) {
			mealMap.set(meal.id, meal);
		}

		return { monthGridMeals, mealMap };
	}, [meals]);

	const handleMealClick = useCallback(
		(meal: MonthGridMeal) => {
			const calendarEvent = mealMap.get(meal.id);
			if (calendarEvent) {
				onMealClick?.(calendarEvent);
			}
		},
		[mealMap, onMealClick],
	);

	const renderMeal = useCallback(
		(
			meal: MonthGridMeal,
			props: Parameters<NonNullable<MonthGridProps['renderMeal']>>[1],
		) => {
			const calendarEvent = mealMap.get(meal.id);
			if (!calendarEvent) return null;

			return (
				<MealEventCard
					event={meal}
					tabIndex={props.tabIndex}
					ref={props.ref}
					onClick={() => {
						onMealClick?.(calendarEvent);
					}}
				/>
			);
		},
		[mealMap, onMealClick],
	);

	return (
		<MonthGrid
			meals={monthGridMeals}
			renderMeal={renderMeal}
			onMealClick={handleMealClick}
		/>
	);
}
