import type { ReactElement, ReactNode } from 'react';

import { Box, Flex, Stack, Text } from '@mantine/core';

import { DishListItem } from './DishListItem';
import styles from './MealCard.module.css';

import type { ListViewDish, ListViewEvent } from '../ListViewEvent.types';

export interface MealCardProps {
	event: ListViewEvent;
	renderDish?: (dish: ListViewDish) => ReactNode;
}

const DRAG_HANDLE_POSITIONS = [
	'top-left',
	'top-right',
	'middle-left',
	'middle-right',
	'bottom-left',
	'bottom-right',
] as const;

export function MealCard({ event, renderDish }: MealCardProps): ReactElement {
	const defaultRenderDish = (dish: ListViewDish) => (
		<Text size="sm">{dish.name}</Text>
	);

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
				{event.dishes.length > 0 && (
					<Stack className={styles.dishList} gap="5px">
						{event.dishes.map((dish) => (
							<DishListItem
								key={dish.name}
								dish={dish}
								renderName={renderDish ?? defaultRenderDish}
							/>
						))}
					</Stack>
				)}
			</Box>
		</Flex>
	);
}
