'use client';

import { useCallback, useMemo } from 'react';

import type { DayInterface } from '@/_models/types';

import { MealEventCard } from './MealEventCard';

import { MonthGrid } from '../Calendar';
import type { MonthGridMeal, MonthGridProps } from '../Calendar';
import { toCalendarEvents } from '../../_utils/toCalendarEvents';
import type { CalendarEvent } from '../../_utils/types';
import type { SavedItem } from '../../types';

interface MealCalendarProps {
	calendar: DayInterface[];
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
