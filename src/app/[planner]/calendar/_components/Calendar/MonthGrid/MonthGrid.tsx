'use client';

import { useMemo } from 'react';

import { Box, Paper, SimpleGrid, Text } from '@mantine/core';

import { DateTime } from 'luxon';

import { MonthGridDayCell } from './MonthGridDayCell';
import { useMonthGridKeyboard } from './useMonthGridKeyboard';
import type { MonthGridMeal, MonthGridProps } from './types';

import { useCalendarContext } from '../CalendarContext';
import { getMonthGridDates } from '../_utils/getMonthGridDates';
import { WEEKDAY_LABELS } from '../_utils/weekdays';

export function MonthGrid({ meals, renderMeal, onMealClick }: MonthGridProps) {
	const { selectedDate } = useCalendarContext();

	const days = useMemo(() => getMonthGridDates(selectedDate), [selectedDate]);
	const today = DateTime.now();

	const mealsByDate = useMemo(() => {
		const map = new Map<string, MonthGridMeal[]>();
		for (const meal of meals ?? []) {
			const list = map.get(meal.date) ?? [];
			list.push(meal);
			map.set(meal.date, list);
		}
		return map;
	}, [meals]);

	const { getDayProps, getMealProps } = useMonthGridKeyboard({
		days,
		mealsByDate,
		onMealClick,
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
					const isoDate = day.toISODate() as string;
					return (
						<MonthGridDayCell
							key={isoDate}
							day={day}
							isToday={day.hasSame(today, 'day')}
							isCurrentMonth={day.hasSame(selectedDate, 'month')}
							meals={mealsByDate.get(isoDate) ?? []}
							dayProps={getDayProps(dayIndex)}
							getMealProps={(mealIndex) =>
								getMealProps(dayIndex, mealIndex, isoDate)
							}
							renderMeal={renderMeal}
						/>
					);
				})}
			</SimpleGrid>
		</Box>
	);
}
