'use client';

import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';

import { Group, Paper, ScrollArea, Stack, Text } from '@mantine/core';

import { useTodayOrThrow } from '@/_hooks';
import { formatDate } from '@/_utils/formatDate';

import styles from './MobileAgenda.module.css';

import { useCalendarContext } from '../CalendarContext';
import { useDayMeals } from '../../../_hooks/useCalendarMeals';
import { MealCard } from '../MealCard/MealCard';

interface MobileAgendaProps {
	plannerId: string;
}

export function MobileAgenda({ plannerId }: MobileAgendaProps): ReactElement {
	const { selectedDate } = useCalendarContext();
	const dayMeals = useDayMeals(selectedDate);
	const viewportRef = useRef<HTMLDivElement>(null);

	const today = useTodayOrThrow();
	const isToday = selectedDate.hasSame(today, 'day');
	const isoDate = selectedDate.toISODate() as string;

	// biome-ignore lint/correctness/useExhaustiveDependencies: effect must re-run when the selected date changes to reset the agenda scroll position.
	useEffect(() => {
		viewportRef.current?.scrollTo?.({ top: 0 });
	}, [isoDate]);

	const dateLabel = formatDate(selectedDate, 'weekdayMonthDay');
	const headerLabel = isToday ? `Today · ${dateLabel}` : dateLabel;
	const mealCountLabel =
		dayMeals.length === 1 ? '1 MEAL' : `${dayMeals.length} MEALS`;

	return (
		<Paper bg="chalk.0" flex={1} mih={0}>
			<ScrollArea scrollbars="y" type="auto" viewportRef={viewportRef}>
				<Stack gap="sm" className={styles.stack}>
					<Group justify="space-between">
						<Text aria-live="polite" fw={700}>
							{headerLabel}
						</Text>
						<Text c="var(--text-muted)" tt="uppercase">
							{mealCountLabel}
						</Text>
					</Group>

					{dayMeals.length > 0 ? (
						dayMeals.map((meal) => (
							<MealCard key={meal.id} meal={meal} plannerId={plannerId} />
						))
					) : (
						<Paper bg="white" radius="md" p="md" className={styles.emptyCard}>
							<Text c="var(--text-muted)" ta="center">
								Nothing planned yet
							</Text>
						</Paper>
					)}
				</Stack>
			</ScrollArea>
		</Paper>
	);
}
