'use client';

import { forwardRef } from 'react';

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

export const DishRowExpanded = forwardRef<HTMLTextAreaElement, Props>(
	({ dish, index, onUpdate }, ref) => {
		return (
			<Stack gap={9} className={classes.expandedContent}>
				<SimpleGrid cols={{ base: 1, sm: 2 }} className={classes.expandedGrid}>
					<DishSourceFields dish={dish} index={index} onUpdate={onUpdate} />
					<DishNoteField
						ref={ref}
						dish={dish}
						index={index}
						onUpdate={onUpdate}
					/>
				</SimpleGrid>
			</Stack>
		);
	},
);

DishRowExpanded.displayName = 'DishRowExpanded';
