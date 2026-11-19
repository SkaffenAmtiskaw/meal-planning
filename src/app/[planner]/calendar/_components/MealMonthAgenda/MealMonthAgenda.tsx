'use client';

import { useCallback, useMemo } from 'react';
import type { ReactElement } from 'react';

import { Stack } from '@mantine/core';

import type { DayInterface } from '@/_models/types';
import { MobileAddMealButton } from '@/app/[planner]/calendar/_components/AddMealButton';

import type { CalendarDish, CalendarMeal } from '../Calendar';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';
import type { SavedItem } from '../../types';
import { MobileAgenda } from '../Calendar/MobileAgenda/MobileAgenda';
import { MobileMonthGrid } from '../Calendar/MobileMonthGrid/MobileMonthGrid';
import type { MobileMonthGridMeal } from '../Calendar/MobileMonthGrid/types';
import { DishLink } from '../DishLink/DishLink';

interface MealMonthAgendaProps {
	plannerId: string;
	calendar: DayInterface[];
	savedItems?: SavedItem[];
}

export function MealMonthAgenda({
	plannerId,
	calendar,
	savedItems,
}: MealMonthAgendaProps): ReactElement {
	const meals = useMemo<CalendarMeal[]>(
		() => toCalendarMeals(calendar, savedItems),
		[calendar, savedItems],
	);

	const dots = useMemo<MobileMonthGridMeal[]>(
		() =>
			meals.map((meal) => ({
				id: meal.id,
				date: meal.date,
				color: meal.borderColor,
			})),
		[meals],
	);

	const renderDish = useCallback(
		(dish: CalendarDish) => (
			<DishLink dish={dish} plannerId={plannerId} size="sm" />
		),
		[plannerId],
	);

	return (
		<Stack flex={1} mih={0} gap="md">
			<MobileMonthGrid meals={dots} />
			<MobileAgenda meals={meals} renderDish={renderDish} />
			<MobileAddMealButton />
		</Stack>
	);
}
