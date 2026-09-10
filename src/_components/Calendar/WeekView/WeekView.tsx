'use client';

import { type ReactElement, useMemo } from 'react';

import { Badge, Box, Divider, Flex, Text } from '@mantine/core';

import { DateTime } from 'luxon';

import styles from './WeekView.module.css';

import { useCalendarContext } from '../CalendarContext';
import { getWeekDates } from '../_utils/getWeekDates';
import { WEEKDAY_LABELS } from '../_utils/weekdays';

export function WeekView(): ReactElement {
	const { selectedDate } = useCalendarContext();
	const days = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
	const today = DateTime.now();

	return (
		<Flex direction="column" h="100%" p="md">
			<Box className={styles.grid}>
				{days.map((day, index) => {
					const isToday = day.hasSame(today, 'day');
					const label = `${WEEKDAY_LABELS[index]} ${day.month}/${day.day}`;

					return (
						<Box
							key={day.toISODate()}
							p="xs"
							className={styles.dayColumn}
							data-testid="week-day-column"
						>
							<Box className={styles.dayHeader}>
								{isToday ? (
									<Badge color="ember" data-testid="week-day-today">
										{label}
									</Badge>
								) : (
									<Text fw={700} size="sm" data-testid="week-day-label">
										{label}
									</Text>
								)}
							</Box>
							<Divider my="xs" />
						</Box>
					);
				})}
			</Box>
		</Flex>
	);
}
