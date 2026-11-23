'use client';

import { type ReactElement, useMemo } from 'react';

import { Box, SimpleGrid, Text } from '@mantine/core';

import { useToday } from '@/_hooks';

import { MobileMonthGridDayCell } from './MobileMonthGridDayCell';
import type { MobileMonthGridMeal } from './types';

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
	const { today } = useToday();
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
				{days.map((day, dayIndex) => {
					const isoDate = day.toISODate() as string;

					return (
						<MobileMonthGridDayCell
							key={isoDate}
							day={day}
							isToday={today !== null && day.hasSame(today, 'day')}
							isSelected={day.hasSame(selectedDate, 'day')}
							isCurrentMonth={day.hasSame(selectedDate, 'month')}
							meals={mealsByDate.get(isoDate) ?? []}
							dayProps={getDayProps(dayIndex)}
							onSelect={() => setSelectedDate(day)}
						/>
					);
				})}
			</SimpleGrid>
		</Box>
	);
}
