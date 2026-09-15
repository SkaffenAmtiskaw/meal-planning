'use client';

import type { ReactElement, ReactNode } from 'react';

import { Badge, Box, Flex, rgba, Stack, Text } from '@mantine/core';

import type { DateTime } from 'luxon';

import { ListViewAddMealTrigger } from './ListViewAddMealTrigger';
import { MealCard } from './MealCard';
import styles from './DayRow.module.css';

import type { ListViewDish, ListViewEvent } from '../ListViewEvent.types';

export interface DayRowProps {
	date: DateTime;
	today: DateTime;
	meals?: ListViewEvent[];
	onAddMeal?: (date: DateTime) => void;
	renderDish?: (dish: ListViewDish) => ReactNode;
}

export function DayRow({
	date,
	today,
	meals = [],
	onAddMeal,
	renderDish,
}: DayRowProps): ReactElement {
	const isToday = date.hasSame(today, 'day');
	const isFirstOfMonth = date.day === 1;
	const hasMeals = meals.length > 0;

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
					{onAddMeal && (
						<ListViewAddMealTrigger
							variant="gutter"
							onClick={() => onAddMeal(date)}
						/>
					)}
				</Box>
			</Box>
			<Box flex={1} miw={0} mih={40}>
				{hasMeals || onAddMeal ? (
					<Stack gap="xs">
						{hasMeals
							? meals.map((meal) => (
									<MealCard
										key={meal.id}
										event={meal}
										renderDish={renderDish}
									/>
								))
							: onAddMeal && (
									<ListViewAddMealTrigger
										variant="ghost"
										onClick={() => onAddMeal(date)}
									/>
								)}
					</Stack>
				) : null}
			</Box>
		</Flex>
	);
}
