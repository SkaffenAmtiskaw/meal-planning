'use client';

import { type ReactElement, type ReactNode, useMemo } from 'react';

import { Badge, Box, Divider, Flex, Paper, Stack, Text } from '@mantine/core';

import { DateTime } from 'luxon';

import focusClasses from '@/_theme/focus.module.css';

import {
	type MealKeyboardProps,
	useWeekViewKeyboard,
} from './useWeekViewKeyboard';
import styles from './WeekView.module.css';

import { useCalendarContext } from '../CalendarContext';
import { getWeekDates } from '../_utils/getWeekDates';
import { WEEKDAY_LABELS } from '../_utils/weekdays';

export interface WeekViewMeal {
	id: string;
	date: string; // ISO date YYYY-MM-DD
	title: string;
	description?: string;
}

export type WeekViewMealRenderProps = MealKeyboardProps;

export interface WeekViewProps {
	meals?: WeekViewMeal[];
	renderMeal?: (
		meal: WeekViewMeal,
		props: WeekViewMealRenderProps,
	) => ReactNode;
	onMealClick?: (meal: WeekViewMeal) => void;
}

export function WeekView({
	meals = [],
	renderMeal,
	onMealClick,
}: WeekViewProps): ReactElement {
	const { selectedDate } = useCalendarContext();
	const days = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
	const today = DateTime.now();

	const mealsByDate = useMemo(() => {
		const grouped = new Map<string, WeekViewMeal[]>();

		for (const meal of meals) {
			const existing = grouped.get(meal.date) ?? [];
			existing.push(meal);
			grouped.set(meal.date, existing);
		}

		return grouped;
	}, [meals]);

	const { getDayProps, getMealProps } = useWeekViewKeyboard({
		days,
		mealsByDate,
		onMealClick,
		selectedDate,
	});

	return (
		<Flex direction="column" h="100%" p="md">
			<Box className={styles.grid} role="grid">
				{days.map((day, index) => {
					const isoDate = day.toISODate() as string;
					const isToday = day.hasSame(today, 'day');
					const label = `${WEEKDAY_LABELS[index]} ${day.month}/${day.day}`;
					const dayMeals = mealsByDate.get(isoDate) ?? [];
					const ariaLabel =
						dayMeals.length > 0
							? `${label}, ${dayMeals.length} meals`
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
								{dayMeals.map((meal, mealIndex) => {
									const mealProps = getMealProps(index, mealIndex, isoDate);

									return (
										<Box key={meal.id} onClick={(e) => e.stopPropagation()}>
											{renderMeal ? (
												renderMeal(meal, mealProps)
											) : (
												<Paper
													data-testid="week-event"
													className={focusClasses.focusRing}
													tabIndex={mealProps.tabIndex}
													ref={mealProps.ref}
													role="button"
													onClick={() => onMealClick?.(meal)}
												>
													{meal.title}
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
