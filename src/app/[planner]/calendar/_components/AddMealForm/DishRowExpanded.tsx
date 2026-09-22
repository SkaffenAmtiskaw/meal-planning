'use client';

import { SimpleGrid, Stack } from '@mantine/core';

import { DishNoteField } from './DishNoteField';
import { DishSourceFields } from './DishSourceFields';
import type { DishState } from './types';
import classes from './DishRow.module.css';

type Props = {
	dish: DishState;
	index: number;
	onUpdate: (patch: Partial<DishState>) => void;
};

export const DishRowExpanded = ({ dish, index, onUpdate }: Props) => {
	return (
		<Stack gap={9} className={classes.expandedContent}>
			<SimpleGrid cols={{ base: 1, sm: 2 }} className={classes.expandedGrid}>
				<DishSourceFields dish={dish} index={index} onUpdate={onUpdate} />
				<DishNoteField dish={dish} index={index} onUpdate={onUpdate} />
			</SimpleGrid>
		</Stack>
	);
};
