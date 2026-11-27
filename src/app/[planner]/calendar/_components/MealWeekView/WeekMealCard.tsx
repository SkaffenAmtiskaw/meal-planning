import type { ReactElement } from 'react';

import { Box, Paper, Text } from '@mantine/core';

import { getMealColor, TAG_COLORS } from '@/_theme/colors';
import focusClasses from '@/_theme/focus.module.css';

import type { CalendarMeal } from '../Calendar';
import { DishLink } from '../DishLink/DishLink';

interface WeekMealCardProps {
	meal: CalendarMeal;
	plannerId: string;
	onClick?: () => void;
	tabIndex?: number;
	ref?: React.Ref<HTMLButtonElement>;
}

export function WeekMealCard({
	meal,
	plannerId,
	onClick,
	tabIndex,
	ref,
}: WeekMealCardProps): ReactElement {
	const tagColor = getMealColor(meal.name);
	const { bg, text, border } = TAG_COLORS[tagColor];

	return (
		<Paper
			component="button"
			type="button"
			p="xs"
			w="100%"
			ta="left"
			data-testid="week-meal-card"
			className={focusClasses.focusRing}
			// The card's colors come from the meal's tag, which no theme value or Paper prop can set.
			style={{
				backgroundColor: bg,
				color: text,
				border: `1px solid ${border}`,
				cursor: 'pointer',
			}}
			onClick={onClick}
			tabIndex={tabIndex}
			ref={ref}
		>
			{/* The theme gives Text its own navy, so each line takes the tag's text color again. */}
			<Text fw={700} size="sm" style={{ color: text }}>
				{meal.name}
			</Text>
			{meal.description && (
				<Text size="xs" style={{ color: text }}>
					{meal.description}
				</Text>
			)}
			{meal.dishes.map((dish) => (
				<Box key={dish._id} style={{ color: text }}>
					<DishLink dish={dish} plannerId={plannerId} tabIndex={-1} />
				</Box>
			))}
		</Paper>
	);
}
