'use client';

import { type ReactElement, useMemo } from 'react';

import {
	Badge,
	Box,
	Center,
	Group,
	SimpleGrid,
	Stack,
	Text,
	UnstyledButton,
} from '@mantine/core';

import { DateTime } from 'luxon';

import { useCalendarContext } from '@/_components/Calendar';
import { useRovingGridFocus } from '@/_components/Calendar/_hooks/useRovingGridFocus';
import { getMonthGridDates } from '@/_components/Calendar/_utils/getMonthGridDates';
import { WEEKDAY_LABELS } from '@/_components/Calendar/_utils/weekdays';
import focusClasses from '@/_theme/focus.module.css';

import styles from './MobileMonthGrid.module.css';

export interface MobileMonthGridEvent {
	id: string;
	date: string; // ISO date YYYY-MM-DD
	color: string; // tag-color border value to use for the dot
}

export interface MobileMonthGridProps {
	events?: MobileMonthGridEvent[];
}

export function MobileMonthGrid({
	events = [],
}: MobileMonthGridProps): ReactElement {
	const { selectedDate, setSelectedDate } = useCalendarContext();
	const days = useMemo(() => getMonthGridDates(selectedDate), [selectedDate]);
	const today = DateTime.now();
	const initialFocusIndex = useMemo(
		() => days.findIndex((day) => day.hasSame(selectedDate, 'day')),
		[days, selectedDate],
	);
	const { getDayProps } = useRovingGridFocus({ days, initialFocusIndex });

	const eventsByDate = useMemo(() => {
		const map = new Map<string, MobileMonthGridEvent[]>();

		for (const event of events) {
			const list = map.get(event.date) ?? [];
			list.push(event);
			map.set(event.date, list);
		}

		return map;
	}, [events]);

	return (
		<Box>
			<SimpleGrid cols={7} spacing="1px">
				{WEEKDAY_LABELS.map((label) => (
					<Text
						key={label}
						size="xs"
						fw={500}
						c="navy.4"
						ta="center"
						tt="uppercase"
					>
						{label.charAt(0)}
					</Text>
				))}
			</SimpleGrid>

			<SimpleGrid cols={7} spacing="1px" role="grid">
				{days.map((day) => {
					const isoDate = day.toISODate() as string;
					const isToday = day.hasSame(today, 'day');
					const isCurrentMonth = day.hasSame(selectedDate, 'month');
					const isSelected = day.hasSame(selectedDate, 'day');
					const dayNumber = day.day;

					const dayEvents = eventsByDate.get(isoDate) ?? [];
					const visibleEvents = dayEvents.slice(0, 3);
					const mealCount = dayEvents.length;

					const dayIndex = days.findIndex((d) => d.hasSame(day, 'day'));
					const dayProps = getDayProps(dayIndex);

					return (
						<UnstyledButton
							key={isoDate}
							data-testid="mobile-day-cell"
							className={`${focusClasses.focusRing} ${styles.dayCell}`}
							aria-label={`${day.toFormat('MMMM d')}, ${mealCount} meals`}
							aria-pressed={isSelected}
							bg={isSelected ? (isToday ? 'ember.0' : 'chalk.0') : undefined}
							{...dayProps}
							onClick={() => setSelectedDate(day)}
						>
							<Stack gap={3} align="center">
								<Center>
									{isToday ? (
										<Badge circle color="ember">
											{dayNumber}
										</Badge>
									) : (
										<Text
											size="xs"
											c={isCurrentMonth ? undefined : 'navy.2'}
											fw={isSelected ? 700 : undefined}
										>
											{dayNumber}
										</Text>
									)}
								</Center>

								<Group gap={4} justify="center" wrap="nowrap" aria-hidden>
									{visibleEvents.map((event) => (
										<Box
											key={event.id}
											className={styles.dot}
											style={{ backgroundColor: event.color }}
											aria-hidden
										/>
									))}
								</Group>
							</Stack>
						</UnstyledButton>
					);
				})}
			</SimpleGrid>
		</Box>
	);
}
