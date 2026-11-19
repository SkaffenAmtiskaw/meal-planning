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

import focusClasses from '@/_theme/focus.module.css';

import type { MobileMonthGridMeal } from './types';
import styles from './MobileMonthGrid.module.css';

import { useCalendarContext } from '../CalendarContext';
import { useRovingGridFocus } from '../_hooks/useRovingGridFocus';
import { getMonthGridDates } from '../_utils/getMonthGridDates';
import { WEEKDAY_LABELS } from '../_utils/weekdays';

interface MobileMonthGridProps {
	meals?: MobileMonthGridMeal[];
}

export function MobileMonthGrid({
	meals = [],
}: MobileMonthGridProps): ReactElement {
	const { selectedDate, setSelectedDate } = useCalendarContext();
	const days = useMemo(() => getMonthGridDates(selectedDate), [selectedDate]);
	const today = DateTime.now();
	const initialFocusIndex = useMemo(
		() => days.findIndex((day) => day.hasSame(selectedDate, 'day')),
		[days, selectedDate],
	);
	const { getDayProps } = useRovingGridFocus({ days, initialFocusIndex });

	const mealsByDate = useMemo(() => {
		const map = new Map<string, MobileMonthGridMeal[]>();

		for (const meal of meals) {
			const list = map.get(meal.date) ?? [];
			list.push(meal);
			map.set(meal.date, list);
		}

		return map;
	}, [meals]);

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

					const dayMeals = mealsByDate.get(isoDate) ?? [];
					const visibleMeals = dayMeals.slice(0, 3);
					const mealCount = dayMeals.length;

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
									{visibleMeals.map((meal) => (
										<Box
											key={meal.id}
											className={styles.dot}
											style={{ backgroundColor: meal.color }}
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
