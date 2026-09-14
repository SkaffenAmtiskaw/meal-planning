import type { ReactElement } from 'react';

import { Box, Flex, Text } from '@mantine/core';

import styles from './MealCard.module.css';

import type { ListViewEvent } from '../ListViewEvent.types';

export interface MealCardProps {
	event: ListViewEvent;
}

const DRAG_HANDLE_POSITIONS = [
	'top-left',
	'top-right',
	'middle-left',
	'middle-right',
	'bottom-left',
	'bottom-right',
] as const;

export function MealCard({ event }: MealCardProps): ReactElement {
	return (
		<Flex>
			<Box className={styles.dragHandle}>
				<Box className={styles.dragHandleGrid}>
					{DRAG_HANDLE_POSITIONS.map((position) => (
						<Box
							key={position}
							className={styles.dragHandleDot}
							data-testid="drag-handle-dot"
						/>
					))}
				</Box>
			</Box>
			<Box
				className={styles.mealCard}
				data-testid="meal-card"
				style={{ borderLeft: `4px solid ${event.borderColor}` }}
			>
				<Text size="sm" fw={600} c="navy">
					{event.name}
				</Text>
				{event.description && (
					<Text size="xs" c="navy.4">
						{event.description}
					</Text>
				)}
			</Box>
		</Flex>
	);
}
