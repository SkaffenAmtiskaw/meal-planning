import { Stack, Text } from '@mantine/core';

import type { CalendarMeal } from '../Calendar';
import { DishLink } from '../DishLink/DishLink';

type Props = {
	meal: CalendarMeal;
	plannerId: string;
};

export const MealDetails = ({ meal, plannerId }: Props) => (
	<Stack gap="xs">
		{meal.dishes.map((dish) => (
			<div key={dish._id}>
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
);
