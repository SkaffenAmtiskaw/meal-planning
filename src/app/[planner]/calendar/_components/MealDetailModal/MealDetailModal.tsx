import { useMemo } from 'react';

import { Modal, Stack, Text } from '@mantine/core';

import { MealDetails } from './MealDetails';

import { useCalendarDays } from '../../_hooks/useCalendarDays';
import { usePlannerSavedItems } from '../../_hooks/usePlannerSavedItems';
import { toCalendarMeals } from '../../_utils/toCalendarMeals';
import type { CalendarModalFrameProps } from '../CalendarModal/types';

export const MealDetailModal = ({
	data,
	close,
	plannerId,
}: CalendarModalFrameProps<'meal_detail'>) => {
	const calendar = useCalendarDays();
	const savedItems = usePlannerSavedItems();
	const mealId = data?.mealId ?? null;

	const meal = useMemo(
		() =>
			mealId === null
				? null
				: (toCalendarMeals(calendar, savedItems).find(
						(calendarMeal) => calendarMeal.id === mealId,
					) ?? null),
		[calendar, savedItems, mealId],
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
