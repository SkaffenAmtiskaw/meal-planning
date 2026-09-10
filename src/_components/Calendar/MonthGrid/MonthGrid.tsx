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

import focusClasses from '@/_theme/focus.module.css';

import { useMonthGridKeyboard } from './useMonthGridKeyboard';

import { useCalendarContext } from '../CalendarContext';
import { getMonthGridDates } from '../_utils/getMonthGridDates';
import { WEEKDAY_LABELS } from '../_utils/weekdays';

export interface MonthGridEvent {
	id: string;
	date: string; // ISO date YYYY-MM-DD
	title: string;
	description?: string;
}

export interface MonthGridEventRenderProps {
	tabIndex: 0 | -1;
	ref: React.RefCallback<HTMLElement>;
}

export interface MonthGridProps {
	events?: MonthGridEvent[];
	renderEvent?: (
		event: MonthGridEvent,
		props: MonthGridEventRenderProps,
	) => React.ReactNode;
	onEventClick?: (event: MonthGridEvent) => void;
}

export function MonthGrid({
	events,
	renderEvent,
	onEventClick,
}: MonthGridProps) {
	const { selectedDate } = useCalendarContext();

	const days = useMemo(() => getMonthGridDates(selectedDate), [selectedDate]);
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

	const { getDayProps, getEventProps } = useMonthGridKeyboard({
		days,
		eventsByDate,
		onEventClick,
		selectedDate,
	});

	return (
		<Box bg="gray.3">
			<SimpleGrid cols={7} spacing="1px">
				{WEEKDAY_LABELS.map((day) => day.toUpperCase()).map((day) => (
					<Paper key={day} p="xs" radius={0}>
						<Text size="sm" c="gray.5" ta="center" fw={500}>
							{day}
						</Text>
					</Paper>
				))}
			</SimpleGrid>

			<SimpleGrid cols={7} spacing="1px" role="grid">
				{days.map((day, dayIndex) => {
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

					const dayProps = getDayProps(dayIndex);

					return (
						<Paper
							key={isoDate}
							role="gridcell"
							data-testid="day-cell"
							p="xs"
							radius={0}
							className={focusClasses.focusRing}
							style={{ minHeight: '100px' }}
							aria-label={ariaLabel}
							{...dayProps}
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
									{visibleEvents.map((event, eventIndex) => {
										const eventProps = getEventProps(
											dayIndex,
											eventIndex,
											isoDate,
										);
										return (
											// biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents: Wrapper just prevents event propagation
											<div key={event.id} onClick={(e) => e.stopPropagation()}>
												{renderEvent ? (
													renderEvent(event, eventProps)
												) : (
													<div
														tabIndex={eventProps.tabIndex}
														ref={eventProps.ref}
														className={focusClasses.focusRing}
													>
														<Text size="xs">{event.title}</Text>
													</div>
												)}
											</div>
										);
									})}
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
