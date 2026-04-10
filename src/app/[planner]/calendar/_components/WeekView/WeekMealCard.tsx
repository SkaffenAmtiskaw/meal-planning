'use client';

import Link from 'next/link';

import { Anchor, Box, Card, Text } from '@mantine/core';

import { getMealColor, TAG_COLORS } from '@/_theme/colors';

import styles from './WeekView.module.css';

import { resolveDishSource } from '../../_utils/resolveDishSource';
import type {
	MealEvent,
	SavedItem,
	SerializedDish,
	SerializedMeal,
} from '../../_utils/toScheduleXEvents';

type Props = {
	meal: SerializedMeal;
	day: Temporal.PlainDate;
	onMealClick: (event: MealEvent) => void;
	plannerId: string;
	savedMap: Map<string, SavedItem>;
};

const getDishNode = (
	dish: SerializedDish,
	plannerId: string,
): React.ReactNode => {
	const { source } = dish;
	if (typeof source === 'object' && source !== null) {
		if ('url' in source) {
			return (
				<Anchor href={source.url} target="_blank" rel="noreferrer" size="xs">
					{dish.name}
				</Anchor>
			);
		}
		if ('_id' in source) {
			return (
				<Anchor
					component={Link}
					href={`/${plannerId}/recipes/${source._id}`}
					size="xs"
				>
					{dish.name}
				</Anchor>
			);
		}
	}
	return <Text size="xs">{dish.name}</Text>;
};

export const WeekMealCard = ({
	meal,
	day,
	onMealClick,
	plannerId,
	savedMap,
}: Props) => {
	const resolvedDishes = meal.dishes.map((dish) =>
		resolveDishSource(dish, savedMap),
	);
	const tagColor = getMealColor(meal.name);
	const { bg, text, border } = TAG_COLORS[tagColor];

	return (
		<Card
			className={styles.card}
			data-testid="week-meal-card"
			p="xs"
			style={{
				backgroundColor: bg,
				color: text,
				border: `1px solid ${border}`,
			}}
			onClick={() =>
				onMealClick({
					id: meal._id,
					start: day,
					end: day,
					title: meal.name,
					description: meal.description,
					dishes: resolvedDishes,
				})
			}
		>
			<Text className={styles.title} fw={700} size="sm" style={{ color: text }}>
				{meal.name}
			</Text>
			{meal.description && (
				<Text className={styles.description} size="sm" style={{ color: text }}>
					{meal.description}
				</Text>
			)}
			{resolvedDishes.map((dish, dishIndex) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: dishes have no stable id
				<Box key={dishIndex} style={{ color: text }}>
					{getDishNode(dish, plannerId)}
				</Box>
			))}
		</Card>
	);
};
