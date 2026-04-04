import Link from 'next/link';

import { Anchor, Box, Card, SimpleGrid, Stack, Text } from '@mantine/core';

import { resolveDishSource } from '../../_utils/resolveDishSource';
import type {
	SavedItem,
	SerializedDay,
	SerializedDish,
} from '../../_utils/toScheduleXEvents';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Props = {
	calendar: SerializedDay[];
	currentWeekStart: Temporal.PlainDate;
	plannerId: string;
	savedItems: SavedItem[];
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

export const WeekView = ({
	calendar,
	currentWeekStart,
	plannerId,
	savedItems,
}: Props) => {
	const dayMap = new Map(calendar.map((d) => [d.date, d]));
	const savedMap = new Map(savedItems.map((item) => [item._id, item]));

	return (
		<SimpleGrid cols={7} spacing={8} data-testid="week-view">
			{Array.from({ length: 7 }, (_, i) => {
				const day = currentWeekStart.add({ days: i });
				const dateStr = day.toString();
				const dayData = dayMap.get(dateStr);
				const label = `${DAY_LABELS[i]} ${day.month}/${day.day}`;

				return (
					<Box key={dateStr} data-testid={`week-day-${dateStr}`}>
						<Text fw={700} size="sm" mb="xs">
							{label}
						</Text>
						<Stack gap="xs">
							{(dayData?.meals ?? []).map((meal) => (
								<Card key={meal._id} data-testid="week-meal-card" p="xs">
									<Text fw={700} size="sm">
										{meal.name}
									</Text>
									{meal.description && (
										<Text size="sm">{meal.description}</Text>
									)}
									{meal.dishes.map((dish, dishIndex) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: dishes have no stable id
										<Box key={dishIndex}>
											{getDishNode(
												resolveDishSource(dish, savedMap),
												plannerId,
											)}
										</Box>
									))}
								</Card>
							))}
						</Stack>
					</Box>
				);
			})}
		</SimpleGrid>
	);
};
