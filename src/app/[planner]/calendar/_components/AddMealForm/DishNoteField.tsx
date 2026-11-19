'use client';

import { forwardRef } from 'react';

import { Stack, Textarea } from '@mantine/core';

import type { DishState } from './types';
import classes from './DishRow.module.css';

type Props = {
	dish: DishState;
	index: number;
	onUpdate: (patch: Partial<DishState>) => void;
};

export const DishNoteField = forwardRef<HTMLTextAreaElement, Props>(
	({ dish, index, onUpdate }, ref) => {
		return (
			<Stack gap={7} className={classes.noteColumn}>
				<Textarea
					ref={ref}
					label="Note"
					placeholder="Prep reminders, swaps, what to buy…"
					autosize={false}
					classNames={{
						root: classes.noteTextareaRoot,
						label: classes.label,
						wrapper: classes.noteTextareaWrapper,
						input: classes.noteTextareaInput,
					}}
					data-testid={`dish-note-${index}`}
					value={dish.note}
					onChange={(e) => onUpdate({ note: e.currentTarget.value })}
				/>
			</Stack>
		);
	},
);

DishNoteField.displayName = 'DishNoteField';
