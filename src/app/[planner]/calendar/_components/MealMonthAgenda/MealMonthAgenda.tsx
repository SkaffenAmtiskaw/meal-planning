'use client';

import { useCallback, useMemo } from 'react';
import type { ReactElement } from 'react';

import { Stack } from '@mantine/core';

import type { DayInterface } from '@/_models/types';
import { getMealColor, TAG_COLORS } from '@/_theme/colors';
import { MobileAddMealButton } from '@/app/[planner]/calendar/_components/AddMealButton';

import type { CalendarDish, CalendarMeal } from '../Calendar';
import { toCalendarEvents } from '../../_utils/toCalendarEvents';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';
import type { CalendarEvent } from '../../_utils/types';
import type { SavedItem } from '../../types';
import { MobileAgenda } from '../Calendar/MobileAgenda/MobileAgenda';
import { MobileMonthGrid } from '../Calendar/MobileMonthGrid/MobileMonthGrid';
import type { MobileMonthGridEvent } from '../Calendar/MobileMonthGrid/types';
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
	const calendarEvents = useMemo<CalendarEvent[]>(
		() => toCalendarEvents(calendar, savedItems),
		[calendar, savedItems],
	);

	const dotEvents = useMemo<MobileMonthGridEvent[]>(
		() =>
			calendarEvents.map((event) => ({
				id: event.id,
				date: event.start,
				color: TAG_COLORS[getMealColor(event.title)].border,
			})),
		[calendarEvents],
	);

	const mealEvents = useMemo<CalendarMeal[]>(
		() => toCalendarMeals(calendarEvents),
		[calendarEvents],
	);

	const renderDish = useCallback(
		(dish: CalendarDish) => (
			<DishLink dish={dish} plannerId={plannerId} size="sm" />
		),
		[plannerId],
	);

	return (
		<Stack flex={1} mih={0} gap="md">
			<MobileMonthGrid events={dotEvents} />
			<MobileAgenda events={mealEvents} renderDish={renderDish} />
			<MobileAddMealButton />
		</Stack>
	);
}
