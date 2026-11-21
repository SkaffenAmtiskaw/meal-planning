import { Modal, Stack, Text } from '@mantine/core';

import { MealDetails } from './MealDetails';

import type { CalendarModalFrameProps } from '../CalendarModal/types';

export const MealDetailModal = ({
	data,
	close,
	plannerId,
}: CalendarModalFrameProps<'meal_detail'>) => {
	const meal = data?.meal ?? null;

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
