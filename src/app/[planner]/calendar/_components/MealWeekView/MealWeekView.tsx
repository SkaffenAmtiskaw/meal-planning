'use client';

import { useCallback, useMemo } from 'react';

import {
	WeekView,
	type WeekViewMeal,
	type WeekViewProps,
} from '@/_components/Calendar';

import { WeekMealCard } from './WeekMealCard';

import type { CalendarEvent } from '../../_utils/toCalendarEvents';
import { toCalendarEvents } from '../../_utils/toCalendarEvents';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';

export interface MealWeekViewProps {
	calendar: SerializedDay[];
	savedItems?: SavedItem[];
	plannerId: string;
	onMealClick?: (meal: CalendarEvent) => void;
}

export function MealWeekView({
	calendar,
	savedItems,
	plannerId,
	onMealClick,
}: MealWeekViewProps) {
	const meals = useMemo(
		() => toCalendarEvents(calendar, savedItems),
		[calendar, savedItems],
	);

	const { weekMeals, mealMap } = useMemo(() => {
		const weekMeals: WeekViewMeal[] = meals.map((meal) => ({
			id: meal.id,
			date: meal.start,
			title: meal.title,
			description: meal.description,
		}));

		const mealMap = new Map<string, CalendarEvent>();
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
