import { Modal, Stack, Text } from '@mantine/core';

import { MealDetails } from './MealDetails';

import type { CalendarMeal } from '../Calendar';

type Props = {
	meal: CalendarMeal | null;
	plannerId: string;
	onClose: () => void;
};

export const MealDetailModal = ({ meal, plannerId, onClose }: Props) => (
	<Modal
		centered
		opened={meal !== null}
		onClose={onClose}
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
