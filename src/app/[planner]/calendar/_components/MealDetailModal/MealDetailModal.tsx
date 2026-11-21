import { useMemo } from 'react';

import { Modal, Stack, Text } from '@mantine/core';

import { MealDetails } from './MealDetails';

import { useCalendarMeals } from '../../_hooks/useCalendarMeals';
import type { CalendarModalFrameProps } from '../CalendarModal/types';

export const MealDetailModal = ({
	data,
	close,
	plannerId,
}: CalendarModalFrameProps<'meal_detail'>) => {
	const meals = useCalendarMeals();
	const mealId = data?.mealId ?? null;

	const meal = useMemo(
		() =>
			mealId === null
				? null
				: (meals.find((calendarMeal) => calendarMeal.id === mealId) ?? null),
		[meals, mealId],
	);

	return (
		<Modal
			centered
			opened={meal !== null}
			onClose={close}
			removeScrollProps={{ removeScrollBar: false }}
			title={
				<Stack gap={2}>
					<Text fw={700} size="lg">
						{meal?.name ?? ''}
					</Text>
					{meal?.description && (
						<Text size="sm" c="dimmed">
							{meal.description}
						</Text>
					)}
				</Stack>
			}
		>
			{meal && <MealDetails meal={meal} plannerId={plannerId} />}
		</Modal>
	);
};
