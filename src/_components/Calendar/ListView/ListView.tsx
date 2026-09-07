'use client';

import { Text } from '@mantine/core';

import { useCalendarContext } from '../CalendarContext';

export function ListView() {
	const { selectedDate } = useCalendarContext();

	return <Text>List View – {selectedDate.toFormat('MMMM d, yyyy')}</Text>;
}
