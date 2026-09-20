import type { ReactElement, ReactNode } from 'react';

import { Box, Stack, Text } from '@mantine/core';

import styles from './MealCard.module.css';

import { DishListItem } from '../_components/DishListItem/DishListItem';
import type { CalendarDish, CalendarMeal } from '../_types/CalendarMeal.types';

export interface MealCardProps {
	event: CalendarMeal;
	renderDish?: (dish: CalendarDish) => ReactNode;
	renderActions?: ReactNode;
}

export function MealCard({
	event,
	renderDish,
	renderActions,
}: MealCardProps): ReactElement {
	const defaultRenderDish = (dish: CalendarDish) => (
		<Text size="sm">{dish.name}</Text>
	);

	return (
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
			{renderActions}
		</Box>
	);
}
