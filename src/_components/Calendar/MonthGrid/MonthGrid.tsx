'use client';

import { useMemo } from 'react';

import {
	Badge,
	Box,
	Center,
	Paper,
	SimpleGrid,
	Stack,
	Text,
} from '@mantine/core';

import { DateTime } from 'luxon';

import { useCalendarContext } from '../CalendarContext';
import { getMonthGridDates } from '../_utils/getMonthGridDates';

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export interface MonthGridEvent {
	id: string;
	date: string; // ISO date YYYY-MM-DD
	title: string;
	description?: string;
}

export interface MonthGridProps {
	events?: MonthGridEvent[];
	renderEvent?: (event: MonthGridEvent) => React.ReactNode;
}

export function MonthGrid({ events, renderEvent }: MonthGridProps) {
	const { selectedDate } = useCalendarContext();

	const days = getMonthGridDates(selectedDate);
	const today = DateTime.now();

	const eventsByDate = useMemo(() => {
		const map = new Map<string, MonthGridEvent[]>();
		for (const event of events ?? []) {
			const list = map.get(event.date) ?? [];
			list.push(event);
			map.set(event.date, list);
		}
		return map;
	}, [events]);

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
					const isoDate = day.toISODate() as string;
					const dayEvents = eventsByDate.get(isoDate) ?? [];
					const visibleEvents = dayEvents.slice(0, 2);
					const overflowCount = dayEvents.length - visibleEvents.length;

					const ariaLabel =
						dayEvents.length > 0
							? `${day.toFormat('MMMM d')}, ${dayEvents.length} events`
							: undefined;

					return (
						<Paper
							key={isoDate}
							role="gridcell"
							data-testid="day-cell"
							p="xs"
							radius={0}
							style={{ minHeight: '100px' }}
							aria-label={ariaLabel}
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
							{dayEvents.length > 0 && (
								<Stack gap="xs" mt="xs">
									{visibleEvents.map((event) => (
										<div key={event.id}>
											{renderEvent ? (
												renderEvent(event)
											) : (
												<Text size="xs">{event.title}</Text>
											)}
										</div>
									))}
									{overflowCount > 0 && (
										<Text size="xs" c="gray.5">
											+{overflowCount} more
										</Text>
									)}
								</Stack>
							)}
						</Paper>
					);
				})}
			</SimpleGrid>
		</Box>
	);
}
