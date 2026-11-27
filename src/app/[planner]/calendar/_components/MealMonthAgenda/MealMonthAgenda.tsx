'use client';

import { useMemo } from 'react';
import type { ReactElement } from 'react';

import { Stack } from '@mantine/core';

import { useToday } from '@/_hooks';
import { MobileAddMealButton } from '@/app/[planner]/calendar/_components/AddMealButton';

import { useCalendarMeals } from '../../_hooks/useCalendarMeals';
import { MobileAgenda } from '../Calendar/MobileAgenda/MobileAgenda';
import { MobileAgendaSkeleton } from '../Calendar/MobileAgenda/MobileAgendaSkeleton';
import { MobileMonthGrid } from '../Calendar/MobileMonthGrid/MobileMonthGrid';
import type { MobileMonthGridMeal } from '../Calendar/MobileMonthGrid/types';

interface MealMonthAgendaProps {
	plannerId: string;
}

export function MealMonthAgenda({
	plannerId,
}: MealMonthAgendaProps): ReactElement {
	const meals = useCalendarMeals();
	const { isKnown } = useToday();

	const dots = useMemo<MobileMonthGridMeal[]>(
		() =>
			meals.map((meal) => ({
				id: meal.id,
				date: meal.date,
				color: meal.borderColor,
			})),
		[meals],
	);

	return (
		<Stack flex={1} mih={0} gap="md">
			<MobileMonthGrid meals={dots} />
			{/* The agenda lists the selected day, which starts on today, so it waits for today. */}
			{isKnown('day') ? (
				<MobileAgenda plannerId={plannerId} />
			) : (
				<MobileAgendaSkeleton />
			)}
			<MobileAddMealButton />
		</Stack>
	);
}
