'use client';

import { useCallback, useMemo } from 'react';
import type { ReactElement } from 'react';

import { Stack } from '@mantine/core';

import { MobileAddMealButton } from '@/app/[planner]/calendar/_components/AddMealButton';

import type { CalendarDish } from '../Calendar';
import { useCalendarMeals } from '../../_hooks/useCalendarMeals';
import { MobileAgenda } from '../Calendar/MobileAgenda/MobileAgenda';
import { MobileMonthGrid } from '../Calendar/MobileMonthGrid/MobileMonthGrid';
import type { MobileMonthGridMeal } from '../Calendar/MobileMonthGrid/types';
import { DishLink } from '../DishLink/DishLink';

interface MealMonthAgendaProps {
	plannerId: string;
}

export function MealMonthAgenda({
	plannerId,
}: MealMonthAgendaProps): ReactElement {
	const meals = useCalendarMeals();

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
