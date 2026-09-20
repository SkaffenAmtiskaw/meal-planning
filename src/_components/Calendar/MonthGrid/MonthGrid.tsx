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

export interface MonthGridMeal {
	id: string;
	date: string; // ISO date YYYY-MM-DD
	title: string;
	description?: string;
}

export interface MonthGridMealRenderProps {
	tabIndex: 0 | -1;
	ref: React.RefCallback<HTMLElement>;
}

export interface MonthGridProps {
	meals?: MonthGridMeal[];
	renderMeal?: (
		meal: MonthGridMeal,
		props: MonthGridMealRenderProps,
	) => React.ReactNode;
	onMealClick?: (meal: MonthGridMeal) => void;
}

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
					const isToday = day.hasSame(today, 'day');
					const isCurrentMonth = day.hasSame(selectedDate, 'month');
					const dayNumber = day.day;
					const isoDate = day.toISODate() as string;
					const dayMeals = mealsByDate.get(isoDate) ?? [];
					const visibleMeals = dayMeals.slice(0, 2);
					const overflowCount = dayMeals.length - visibleMeals.length;

					const ariaLabel =
						dayMeals.length > 0
							? `${day.toFormat('MMMM d')}, ${dayMeals.length} meals`
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
							{dayMeals.length > 0 && (
								<Stack gap="xs" mt="xs">
									{visibleMeals.map((meal, mealIndex) => {
										const mealProps = getMealProps(
											dayIndex,
											mealIndex,
											isoDate,
										);
										return (
											// biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents: Wrapper just prevents event propagation
											<div key={meal.id} onClick={(e) => e.stopPropagation()}>
												{renderMeal ? (
													renderMeal(meal, mealProps)
												) : (
													<div
														tabIndex={mealProps.tabIndex}
														ref={mealProps.ref}
														className={focusClasses.focusRing}
													>
														<Text size="xs">{meal.title}</Text>
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
