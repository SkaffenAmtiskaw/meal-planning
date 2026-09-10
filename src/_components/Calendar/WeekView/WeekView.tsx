'use client';

import { type ReactElement, type ReactNode, useMemo } from 'react';

import { Badge, Box, Divider, Flex, Paper, Stack, Text } from '@mantine/core';

import { DateTime } from 'luxon';

import styles from './WeekView.module.css';

import { useCalendarContext } from '../CalendarContext';
import { getWeekDates } from '../_utils/getWeekDates';
import { WEEKDAY_LABELS } from '../_utils/weekdays';

export interface WeekViewEvent {
	id: string;
	date: string; // ISO date YYYY-MM-DD
	title: string;
	description?: string;
}

export interface WeekViewProps {
	events?: WeekViewEvent[];
	renderEvent?: (event: WeekViewEvent) => ReactNode;
	onEventClick?: (event: WeekViewEvent) => void;
}

export function WeekView({
	events = [],
	renderEvent,
	onEventClick,
}: WeekViewProps): ReactElement {
	const { selectedDate } = useCalendarContext();
	const days = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
	const today = DateTime.now();

	const eventsByDate = useMemo(() => {
		const grouped = new Map<string, WeekViewEvent[]>();

		for (const event of events) {
			const existing = grouped.get(event.date) ?? [];
			existing.push(event);
			grouped.set(event.date, existing);
		}

		return grouped;
	}, [events]);

	return (
		<Flex direction="column" h="100%" p="md">
			<Box className={styles.grid}>
				{days.map((day, index) => {
					const isoDate = day.toISODate() as string;
					const isToday = day.hasSame(today, 'day');
					const label = `${WEEKDAY_LABELS[index]} ${day.month}/${day.day}`;
					const dayEvents = eventsByDate.get(isoDate) ?? [];

					return (
						<Box
							key={isoDate}
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
							<Stack gap="xs">
								{dayEvents.map((event) => (
									<Box key={event.id}>
										{renderEvent ? (
											renderEvent(event)
										) : (
											<Paper
												data-testid="week-event"
												onClick={() => onEventClick?.(event)}
											>
												{event.title}
											</Paper>
										)}
									</Box>
								))}
							</Stack>
						</Box>
					);
				})}
			</Box>
		</Flex>
	);
}
