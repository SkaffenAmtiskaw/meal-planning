'use client';

import type { ReactElement, ReactNode } from 'react';

import { Badge, Box, Flex, rgba, Stack, Text } from '@mantine/core';

import type { DateTime } from 'luxon';

import type { CalendarDish, CalendarMeal } from '@/_components/Calendar';
import { useCanWrite } from '@/app/[planner]/_components';

import { ListViewAddMealTrigger } from './ListViewAddMealTrigger';
import { MealCardWithDragHandle } from './MealCardWithDragHandle';
import styles from './DayRow.module.css';

import { useCalendarModal } from '../../CalendarModal';

export interface DayRowProps {
	date: DateTime;
	today: DateTime;
	meals?: CalendarMeal[];
	renderDish?: (dish: CalendarDish) => ReactNode;
}

export function DayRow({
	date,
	today,
	meals = [],
	renderDish,
}: DayRowProps): ReactElement {
	const canWrite = useCanWrite();
	const { open } = useCalendarModal();
	const isToday = date.hasSame(today, 'day');
	const isFirstOfMonth = date.day === 1;
	const hasMeals = meals.length > 0;

	const handleAddMeal = (): void => {
		open('add_meal', { initialDate: date.toISODate() ?? undefined });
	};

	return (
		<Flex
			className={styles.row}
			data-iso={date.toISODate()}
			style={
				isToday
					? { backgroundColor: rgba('var(--mantine-color-ember-0)', 0.5) }
					: undefined
			}
		>
			<Box className={styles.gutter}>
				<Box className={styles.gutterContent}>
					<Text
						className={styles.gutterText}
						size="xs"
						fw={700}
						c="navy.4"
						tt="uppercase"
					>
						{date.toFormat('ccc').toUpperCase()}
					</Text>
					<Flex className={styles.dateLine} align="center" gap={4}>
						{isToday ? (
							<Badge circle color="ember" size="lg">
								{date.day}
							</Badge>
						) : (
							<Text size="xl" fw={500}>
								{date.day}
							</Text>
						)}
					</Flex>
					{isFirstOfMonth && (
						<Text
							className={styles.gutterText}
							size="xs"
							fw={600}
							c="ember.5"
							tt="uppercase"
						>
							{date.toFormat('MMM').toUpperCase()}
						</Text>
					)}
					{canWrite && (
						<ListViewAddMealTrigger variant="gutter" onClick={handleAddMeal} />
					)}
				</Box>
			</Box>
			<Box flex={1} miw={0} mih={40}>
				{hasMeals || canWrite ? (
					<Stack gap="xs">
						{hasMeals
							? meals.map((meal) => (
									<MealCardWithDragHandle
										key={meal.id}
										event={meal}
										renderDish={renderDish}
									/>
								))
							: canWrite && (
									<ListViewAddMealTrigger
										variant="ghost"
										onClick={handleAddMeal}
									/>
								)}
					</Stack>
				) : null}
			</Box>
		</Flex>
	);
}
