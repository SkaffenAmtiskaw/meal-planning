'use client';

import { Text } from '@mantine/core';

import { useCalendarContext } from '../CalendarContext';
import { formatWeekRange } from '../_utils/formatWeekRange';

export function WeekView() {
	const { selectedDate } = useCalendarContext();

	return (
		<div>
			<Text>Week View – {formatWeekRange(selectedDate)}</Text>
		</div>
	);
}
