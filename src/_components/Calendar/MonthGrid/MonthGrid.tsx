'use client';

import { Badge, Box, Center, Paper, SimpleGrid, Text } from '@mantine/core';

import { DateTime } from 'luxon';

import { useCalendarContext } from '../CalendarContext';
import { getMonthGridDates } from '../_utils/getMonthGridDates';

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export function MonthGrid() {
	const { selectedDate } = useCalendarContext();

	const days = getMonthGridDates(selectedDate);
	const today = DateTime.now();

	return (
		<Box bg="gray.3">
			<SimpleGrid cols={7} spacing="1px">
				{WEEKDAYS.map((day) => (
					<Paper key={day} p="xs" radius={0}>
						<Text size="sm" c="gray.5" ta="center" fw={500}>
							{day}
						</Text>
					</Paper>
				))}
			</SimpleGrid>

			<SimpleGrid cols={7} spacing="1px" role="grid">
				{days.map((day) => {
					const isToday = day.hasSame(today, 'day');
					const isCurrentMonth = day.hasSame(selectedDate, 'month');
					const dayNumber = day.day;

					return (
						<Paper
							key={day.toISODate()}
							role="gridcell"
							data-testid="day-cell"
							p="xs"
							radius={0}
							style={{ minHeight: '100px' }}
						>
							<Center>
								{isToday ? (
									<Badge circle color="ember">
										{dayNumber}
									</Badge>
								) : (
									<Text
										size="sm"
										c={isCurrentMonth ? undefined : 'gray.5'}
										ta="center"
									>
										{dayNumber}
									</Text>
								)}
							</Center>
						</Paper>
					);
				})}
			</SimpleGrid>
		</Box>
	);
}
