'use client';

import { Center, Paper, Stack, Text } from '@mantine/core';

import type { DateTime } from 'luxon';

import { NumberMark } from '@/_components';
import focusClasses from '@/_theme/focus.module.css';
import { formatDate } from '@/_utils/formatDate';

import type {
	DayKeyboardProps,
	MealKeyboardProps,
	MonthGridMeal,
	MonthGridProps,
} from './types';

const MAX_VISIBLE_MEALS = 2;

interface MonthGridDayCellProps {
	day: DateTime;
	isToday: boolean;
	isCurrentMonth: boolean;
	meals: MonthGridMeal[];
	dayProps: DayKeyboardProps;
	getMealProps: (mealIndex: number) => MealKeyboardProps;
	renderMeal?: MonthGridProps['renderMeal'];
}

export function MonthGridDayCell({
	day,
	isToday,
	isCurrentMonth,
	meals,
	dayProps,
	getMealProps,
	renderMeal,
}: MonthGridDayCellProps) {
	const visibleMeals = meals.slice(0, MAX_VISIBLE_MEALS);
	const overflowCount = meals.length - visibleMeals.length;

	const ariaLabel =
		meals.length > 0
			? `${formatDate(day, 'monthDay')}, ${meals.length} meals`
			: undefined;

	return (
		<Paper
			role="gridcell"
			data-testid="day-cell"
			p="xs"
			radius={0}
			className={focusClasses.focusRing}
			mih={100}
			aria-label={ariaLabel}
			aria-current={isToday ? 'date' : undefined}
			{...dayProps}
		>
			<Center>
				<NumberMark ring={isToday} muted={!isCurrentMonth}>
					{day.day}
				</NumberMark>
			</Center>
			{meals.length > 0 && (
				<Stack gap="xs" mt="xs">
					{visibleMeals.map((meal, mealIndex) => {
						const mealProps = getMealProps(mealIndex);
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
										<Text size="xs">{meal.name}</Text>
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
}
