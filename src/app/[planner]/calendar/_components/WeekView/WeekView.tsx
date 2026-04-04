import { Box, SimpleGrid, Stack, Text } from '@mantine/core';

import type { SerializedDay } from '../../_utils/toScheduleXEvents';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Props = {
	calendar: SerializedDay[];
	currentWeekStart: Temporal.PlainDate;
};

export const WeekView = ({ calendar, currentWeekStart }: Props) => {
	const dayMap = new Map(calendar.map((d) => [d.date, d]));

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
								<Box key={meal._id} data-testid="week-meal-card" p="xs">
									<Text fw={700} size="sm">
										{meal.name}
									</Text>
									{meal.description && (
										<Text size="sm">{meal.description}</Text>
									)}
									{meal.dishes.map((dish, dishIndex) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: dishes have no stable id
										<Text key={dishIndex} size="xs">
											{dish.name}
										</Text>
									))}
								</Box>
							))}
						</Stack>
					</Box>
				);
			})}
		</SimpleGrid>
	);
};
