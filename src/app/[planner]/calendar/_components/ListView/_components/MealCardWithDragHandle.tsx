import type { ReactElement } from 'react';

import { Box, Flex } from '@mantine/core';

import styles from './MealCardWithDragHandle.module.css';

import { MealCard } from '../../Calendar/MealCard/MealCard';
import type { MealCardProps } from '../../Calendar/MealCard/types';

type MealCardWithDragHandleProps = MealCardProps;

const DRAG_HANDLE_POSITIONS = [
	'top-left',
	'top-right',
	'middle-left',
	'middle-right',
	'bottom-left',
	'bottom-right',
] as const;

export function MealCardWithDragHandle(
	props: MealCardWithDragHandleProps,
): ReactElement {
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
			<Box flex={1}>
				<MealCard {...props} />
			</Box>
		</Flex>
	);
}
