'use client';

import type { MouseEvent, ReactElement, ReactNode } from 'react';

import { Flex, Text } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';

import styles from './DishListItem.module.css';

import type { ListViewDish } from '../ListViewEvent.types';

export type { ListViewDish } from '../ListViewEvent.types';

export interface DishListItemProps {
	dish: ListViewDish;
	renderName: (dish: ListViewDish) => ReactNode;
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
		<Flex
			data-testid="dish-list-item"
			align="baseline"
			wrap="wrap"
			gap="xs"
			onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
		>
			<span className={styles.dishName}>{renderName(dish)}</span>
			{hasUrl && (
				<IconExternalLink size={9} color="var(--mantine-color-forest-5)" />
			)}
			{sourceRef !== undefined && (
				<Text size="xs" c="navy.4" fs="italic" span>
					{String(sourceRef)}
				</Text>
			)}
			{dish.note && (
				<Text size="xs" c="navy.4" span>
					{dish.note}
				</Text>
			)}
		</Flex>
	);
}
