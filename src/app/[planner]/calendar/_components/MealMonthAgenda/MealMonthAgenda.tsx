'use client';

import { useMemo } from 'react';
import type { ReactElement } from 'react';

import { Stack, Text } from '@mantine/core';

import { useCalendarContext } from '@/_components/Calendar';
import {
	MobileMonthGrid,
	type MobileMonthGridEvent,
} from '@/_components/Calendar/MobileMonthGrid/MobileMonthGrid';
import { getMealColor, TAG_COLORS } from '@/_theme/colors';

import { toCalendarEvents } from '../../_utils/toCalendarEvents';
import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';

export interface MealMonthAgendaProps {
	plannerId: string;
	calendar: SerializedDay[];
	savedItems?: SavedItem[];
}

export function MealMonthAgenda({
	plannerId: _plannerId,
	calendar,
	savedItems,
}: MealMonthAgendaProps): ReactElement {
	const { selectedDate } = useCalendarContext();

	const dotEvents = useMemo<MobileMonthGridEvent[]>(() => {
		return toCalendarEvents(calendar, savedItems).map((event) => ({
			id: event.id,
			date: event.start,
			color: TAG_COLORS[getMealColor(event.title)].border,
		}));
	}, [calendar, savedItems]);

	return (
		<Stack>
			<MobileMonthGrid events={dotEvents} />
			<Text>Agenda for {selectedDate.toFormat('MMMM d, yyyy')}</Text>
		</Stack>
	);
}
