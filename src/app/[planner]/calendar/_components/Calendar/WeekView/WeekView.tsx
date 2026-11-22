'use client';

import { type ReactElement, useMemo } from 'react';

import { Box, Divider, Flex, Paper, Stack } from '@mantine/core';

import clsx from 'clsx';
import { DateTime } from 'luxon';

import focusClasses from '@/_theme/focus.module.css';
import { formatDate } from '@/_utils/formatDate';

import { useWeekViewKeyboard } from './useWeekViewKeyboard';
import { WeekDayLabel } from './WeekDayLabel';
import type { WeekViewMeal, WeekViewProps } from './types';
import styles from './WeekView.module.css';

import { useCalendarContext } from '../CalendarContext';
import { getWeekDates } from '../_utils/getWeekDates';

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
					const label = formatDate(day, 'shortWeekdayNumericDate');
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
							className={clsx(styles.dayColumn, focusClasses.focusRing)}
							data-testid="week-day-column"
							aria-label={ariaLabel}
							aria-current={isToday ? 'date' : undefined}
							{...dayProps}
						>
							<Box className={styles.dayHeader}>
								<WeekDayLabel label={label} isToday={isToday} />
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
													data-testid="week-meal"
													className={focusClasses.focusRing}
													tabIndex={mealProps.tabIndex}
													ref={mealProps.ref}
													role="button"
													onClick={() => onMealClick?.(meal)}
												>
													{meal.name}
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
