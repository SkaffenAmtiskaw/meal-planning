'use client';

import type { ReactElement } from 'react';

import { Text } from '@mantine/core';

import { useCalendarContext } from '@/_components/Calendar';

import type { SavedItem, SerializedDay } from '../../_utils/toScheduleXEvents';

export interface MealMonthAgendaProps {
	plannerId: string;
	calendar: SerializedDay[];
	savedItems?: SavedItem[];
}

export function MealMonthAgenda({
	plannerId: _plannerId,
	calendar: _calendar,
	savedItems: _savedItems,
}: MealMonthAgendaProps): ReactElement {
	const { selectedDate } = useCalendarContext();

	return (
		<Text>Mobile month view — {selectedDate.toFormat('MMMM d, yyyy')}</Text>
	);
}
