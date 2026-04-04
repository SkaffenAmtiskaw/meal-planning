import Link from 'next/link';

import { Modal, Stack, Text } from '@mantine/core';

import type { MealEvent, SerializedDish } from '../_utils/toScheduleXEvents';

type Props = {
	event: MealEvent | null;
	plannerId: string;
	onClose: () => void;
};

const getDishName = (
	dish: SerializedDish,
	plannerId: string,
): React.ReactNode => {
	const { source } = dish;
	if (typeof source === 'object' && source !== null) {
		if ('url' in source) {
			return (
				<a href={source.url} target="_blank" rel="noreferrer">
					<Text size="sm" fw={500}>
						{dish.name}
					</Text>
				</a>
			);
		}
		if ('_id' in source) {
			return (
				<Link href={`/${plannerId}/recipes/${source._id}`}>
					<Text size="sm" fw={500}>
						{dish.name}
					</Text>
				</Link>
			);
		}
	}
	return (
		<Text size="sm" fw={500}>
			{dish.name}
		</Text>
	);
};

export const MealDetailModal = ({ event, plannerId, onClose }: Props) => (
	<Modal
		centered
		opened={event !== null}
		onClose={onClose}
		removeScrollProps={{ removeScrollBar: false }}
		title={
			<Stack gap={2}>
				<Text fw={700} size="lg">
					{event?.title ?? ''}
				</Text>
				{event?.description && (
					<Text size="sm" c="dimmed">
						{event.description}
					</Text>
				)}
			</Stack>
		}
	>
		<Stack gap="xs">
			{event?.dishes.map((dish, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: dishes have no stable id
				<div key={i}>
					{getDishName(dish, plannerId)}
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
