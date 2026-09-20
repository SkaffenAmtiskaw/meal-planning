'use client';

import type { MouseEvent, ReactElement, ReactNode } from 'react';

import { Group, Stack, Text } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';

import styles from './DishListItem.module.css';

import type { CalendarDish } from '../../_types/CalendarMeal.types';

export type { CalendarDish } from '../../_types/CalendarMeal.types';

export interface DishListItemProps {
	dish: CalendarDish;
	renderName: (dish: CalendarDish) => ReactNode;
}

export function DishListItem({
	dish,
	renderName,
}: DishListItemProps): ReactElement {
	const hasUrl =
		typeof dish.source === 'object' &&
		dish.source !== null &&
		'url' in dish.source;
	const sourceRef =
		typeof dish.source === 'object' &&
		dish.source !== null &&
		'ref' in dish.source
			? String(dish.source.ref)
			: undefined;

	return (
		<Stack
			data-testid="dish-list-item"
			gap={1}
			onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
		>
			<Group align="baseline" gap="xs" wrap="wrap">
				<span className={styles.dishName}>{renderName(dish)}</span>
				{hasUrl && (
					<IconExternalLink size={9} color="var(--mantine-color-forest-5)" />
				)}
				{sourceRef !== undefined && (
					<Text size="xs" c="navy.4" fs="italic" span>
						{String(sourceRef)}
					</Text>
				)}
			</Group>
			{dish.note && (
				<Text
					size="xs"
					c="navy"
					lh={1.5}
					maw="60ch"
					className={styles.dishNote}
				>
					{dish.note}
				</Text>
			)}
		</Stack>
	);
}
