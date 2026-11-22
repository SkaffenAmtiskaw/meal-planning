'use client';

import { Center, Paper, Stack, Text } from '@mantine/core';

import type { DateTime } from 'luxon';

import { NumberMark } from '@/_components';
import focusClasses from '@/_theme/focus.module.css';

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
			? `${day.toFormat('MMMM d')}, ${meals.length} meals`
			: undefined;

	return (
		<Paper
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
				<NumberMark
					ring={isToday}
					muted={!isCurrentMonth}
					aria-current={isToday ? 'date' : undefined}
				>
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
