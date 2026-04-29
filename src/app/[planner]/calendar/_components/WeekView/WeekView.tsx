import { Box, Divider, SimpleGrid, Stack, Text } from '@mantine/core';

import { WeekMealCard } from './WeekMealCard';
import styles from './WeekView.module.css';

import type {
	MealEvent,
	SavedItem,
	SerializedDay,
} from '../../_utils/toScheduleXEvents';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Props = {
	calendar: SerializedDay[];
	currentWeekStart: Temporal.PlainDate;
	onMealClick: (event: MealEvent) => void;
	plannerId: string;
	savedItems: SavedItem[];
};

export const WeekView = ({
	calendar,
	currentWeekStart,
	onMealClick,
	plannerId,
	savedItems,
}: Props) => {
	const dayMap = new Map(calendar.map((d) => [d.date, d]));
	const savedMap = new Map(savedItems.map((item) => [item._id, item]));

	return (
		<SimpleGrid
			cols={7}
			spacing={8}
			className={styles.grid}
			data-testid="week-view"
		>
			{Array.from({ length: 7 }, (_, i) => {
				const day = currentWeekStart.add({ days: i });
				const dateStr = day.toString();
				const dayData = dayMap.get(dateStr);
				const label = `${DAY_LABELS[i]} ${day.month}/${day.day}`;

				return (
					<Box
						key={dateStr}
						className={styles.dayColumn}
						data-testid={`week-day-${dateStr}`}
					>
						<Text fw={700} size="sm" mb="xs">
							{label}
						</Text>
						<Divider mb="xs" />
						<Stack gap="xs">
							{(dayData?.meals ?? []).map((meal) => (
								<WeekMealCard
									key={meal._id}
									meal={meal}
									day={day}
									onMealClick={onMealClick}
									plannerId={plannerId}
									savedMap={savedMap}
								/>
							))}
						</Stack>
					</Box>
				);
			})}
		</SimpleGrid>
	);
};
