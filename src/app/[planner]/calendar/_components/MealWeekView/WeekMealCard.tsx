import type { ReactElement } from 'react';

import { Box, Paper, Text } from '@mantine/core';

import { getMealColor, TAG_COLORS } from '@/_theme/colors';
import focusClasses from '@/_theme/focus.module.css';

import type { CalendarEvent } from '../../_utils/toCalendarEvents';
import { DishLink } from '../DishLink/DishLink';

export interface WeekMealCardProps {
	event: CalendarEvent;
	plannerId: string;
	onClick?: () => void;
}

export function WeekMealCard({
	event,
	plannerId,
	onClick,
}: WeekMealCardProps): ReactElement {
	const tagColor = getMealColor(event.title);
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
			style={{
				backgroundColor: bg,
				color: text,
				border: `1px solid ${border}`,
				cursor: 'pointer',
			}}
			onClick={onClick}
		>
			<Text fw={700} size="sm" style={{ color: text }}>
				{event.title}
			</Text>
			{event.description && (
				<Text size="xs" style={{ color: text }}>
					{event.description}
				</Text>
			)}
			{event.dishes.map((dish, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: dishes have no stable id
				<Box key={index} style={{ color: text }}>
					<DishLink dish={dish} plannerId={plannerId} />
				</Box>
			))}
		</Paper>
	);
}
