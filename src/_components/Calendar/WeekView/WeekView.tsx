'use client';

import { type ReactElement, type ReactNode, useMemo } from 'react';

import { Badge, Box, Divider, Flex, Paper, Stack, Text } from '@mantine/core';

import { DateTime } from 'luxon';

import focusClasses from '@/_theme/focus.module.css';

import {
	type EventKeyboardProps,
	useWeekViewKeyboard,
} from './useWeekViewKeyboard';
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

export type WeekViewEventRenderProps = EventKeyboardProps;

export interface WeekViewProps {
	events?: WeekViewEvent[];
	renderEvent?: (
		event: WeekViewEvent,
		props: WeekViewEventRenderProps,
	) => ReactNode;
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

	const { getDayProps, getEventProps } = useWeekViewKeyboard({
		days,
		eventsByDate,
		onEventClick,
		selectedDate,
	});

	return (
		<Flex direction="column" h="100%" p="md">
			<Box className={styles.grid} role="grid">
				{days.map((day, index) => {
					const isoDate = day.toISODate() as string;
					const isToday = day.hasSame(today, 'day');
					const label = `${WEEKDAY_LABELS[index]} ${day.month}/${day.day}`;
					const dayEvents = eventsByDate.get(isoDate) ?? [];
					const ariaLabel =
						dayEvents.length > 0
							? `${label}, ${dayEvents.length} events`
							: undefined;
					const dayProps = getDayProps(index);

					return (
						<Box
							key={isoDate}
							role="gridcell"
							p="xs"
							className={`${styles.dayColumn} ${focusClasses.focusRing}`}
							data-testid="week-day-column"
							aria-label={ariaLabel}
							{...dayProps}
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
								{dayEvents.map((event, eventIndex) => {
									const eventProps = getEventProps(index, eventIndex, isoDate);

									return (
										<Box key={event.id} onClick={(e) => e.stopPropagation()}>
											{renderEvent ? (
												renderEvent(event, eventProps)
											) : (
												<Paper
													data-testid="week-event"
													className={focusClasses.focusRing}
													tabIndex={eventProps.tabIndex}
													ref={eventProps.ref}
													role="button"
													onClick={() => onEventClick?.(event)}
												>
													{event.title}
												</Paper>
											)}
										</Box>
									);
								})}
							</Stack>
						</Box>
					);
				})}
			</Box>
		</Flex>
	);
}
