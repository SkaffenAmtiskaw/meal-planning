import { Modal, Stack, Text } from '@mantine/core';

import type { CalendarMeal } from '../Calendar';
import { DishLink } from '../DishLink/DishLink';

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
		<Stack gap="xs">
			{meal?.dishes.map((dish, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: dishes have no stable id
				<div key={i}>
					<DishLink dish={dish} plannerId={plannerId} />
					{typeof dish.source === 'object' &&
						dish.source !== null &&
						'ref' in dish.source && (
							<Text size="xs" c="dimmed">
								{dish.source.ref}
							</Text>
						)}
					{dish.note && (
						<Text size="xs" c="dimmed">
							{dish.note}
						</Text>
					)}
				</div>
			))}
		</Stack>
	</Modal>
);
