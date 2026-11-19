'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { ReactElement } from 'react';

import { Group, Paper, ScrollArea, Stack, Text } from '@mantine/core';

import { DateTime } from 'luxon';

import type { MobileAgendaProps } from './types';
import styles from './MobileAgenda.module.css';

import { useCalendarContext } from '../CalendarContext';
import { MealCard } from '../MealCard/MealCard';

export function MobileAgenda({
	meals = [],
	renderDish,
}: MobileAgendaProps): ReactElement {
	const { selectedDate } = useCalendarContext();
	const viewportRef = useRef<HTMLDivElement>(null);

	const today = DateTime.now().startOf('day');
	const isToday = selectedDate.hasSame(today, 'day');
	const isoDate = selectedDate.toISODate() as string;

	const dayMeals = useMemo(
		() => meals.filter((meal) => meal.date === isoDate),
		[meals, isoDate],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: effect must re-run when the selected date changes to reset the agenda scroll position.
	useEffect(() => {
		viewportRef.current?.scrollTo?.({ top: 0 });
	}, [isoDate]);

	const headerLabel = isToday
		? `Today · ${selectedDate.toFormat('EEEE, MMMM d')}`
		: selectedDate.toFormat('EEEE, MMMM d');
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
						<Text c="navy.4" tt="uppercase">
							{mealCountLabel}
						</Text>
					</Group>

					{dayMeals.length > 0 ? (
						dayMeals.map((meal) => (
							<MealCard key={meal.id} meal={meal} renderDish={renderDish} />
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
