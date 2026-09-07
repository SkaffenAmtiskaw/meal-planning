'use client';

import { Text } from '@mantine/core';

import { useCalendarContext } from '../CalendarContext';

export function MonthGrid() {
	const { selectedDate } = useCalendarContext();

	return <Text>Month View – {selectedDate.toFormat('MMMM yyyy')}</Text>;
}
