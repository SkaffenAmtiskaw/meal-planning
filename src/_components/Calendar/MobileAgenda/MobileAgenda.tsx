'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { Group, Paper, ScrollArea, Stack, Text } from '@mantine/core';

import { DateTime } from 'luxon';

import { useCalendarContext } from '@/_components/Calendar';
import type {
	CalendarDish,
	CalendarMeal,
} from '@/_components/Calendar/_types/CalendarMeal.types';
import { MealCard } from '@/_components/Calendar/MealCard/MealCard';

import styles from './MobileAgenda.module.css';

export interface MobileAgendaProps {
	events?: CalendarMeal[];
	renderDish?: (dish: CalendarDish) => ReactNode;
}

export function MobileAgenda({
	events = [],
	renderDish,
}: MobileAgendaProps): ReactElement {
	const { selectedDate } = useCalendarContext();
	const viewportRef = useRef<HTMLDivElement>(null);

	const today = DateTime.now().startOf('day');
	const isToday = selectedDate.hasSame(today, 'day');
	const isoDate = selectedDate.toISODate() as string;

	const dayEvents = useMemo(
		() => events.filter((event) => event.date === isoDate),
		[events, isoDate],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: effect must re-run when the selected date changes to reset the agenda scroll position.
	useEffect(() => {
		viewportRef.current?.scrollTo?.({ top: 0 });
	}, [isoDate]);

	const headerLabel = isToday
		? `Today · ${selectedDate.toFormat('EEEE, MMMM d')}`
		: selectedDate.toFormat('EEEE, MMMM d');
	const mealCountLabel =
		dayEvents.length === 1 ? '1 MEAL' : `${dayEvents.length} MEALS`;

	return (
		<Paper bg="chalk.0" flex={1} mih={0}>
			<ScrollArea scrollbars="y" type="auto" viewportRef={viewportRef}>
				<Stack gap="sm" className={styles.stack}>
					<Group justify="space-between">
						<Text aria-live="polite" fw={700}>
							{headerLabel}
						</Text>
						<Text c="navy.4" tt="uppercase">
							{mealCountLabel}
						</Text>
					</Group>

					{dayEvents.length > 0 ? (
						dayEvents.map((event) => (
							<MealCard key={event.id} event={event} renderDish={renderDish} />
						))
					) : (
						<Paper bg="white" radius="md" p="md" className={styles.emptyCard}>
							<Text c="navy.4" ta="center">
								Nothing planned yet
							</Text>
						</Paper>
					)}
				</Stack>
			</ScrollArea>
		</Paper>
	);
}
