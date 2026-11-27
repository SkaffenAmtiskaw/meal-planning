import type { ReactElement } from 'react';

import { Paper, Text } from '@mantine/core';

import type { MealCardProps } from './types';

import { MealDishList } from '../_components/MealDishList/MealDishList';

export function MealCard({
	meal,
	plannerId,
	actions,
}: MealCardProps): ReactElement {
	return (
		<Paper
			withBorder
			radius="md"
			pt={9}
			pb={11}
			px="sm"
			data-testid="meal-card"
			// The rail's color comes from the meal, which no theme value or Paper prop can set.
			style={{ borderLeft: `4px solid ${meal.borderColor}` }}
		>
			<Text size="sm" fw={600} c="navy">
				{meal.name}
			</Text>
			{meal.description && (
				<Text size="xs" c="var(--text-muted)">
					{meal.description}
				</Text>
			)}
			{meal.dishes.length > 0 && (
				<MealDishList dishes={meal.dishes} plannerId={plannerId} />
			)}
			{actions}
		</Paper>
	);
}
