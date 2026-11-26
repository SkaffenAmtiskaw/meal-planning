'use client';

import type { Ref } from 'react';

import { SimpleGrid, Stack, Textarea } from '@mantine/core';

import classes from './DishPanel.module.css';

import { useDish } from '../../_hooks/useDish';
import { DishRecipeSection } from '../DishRecipeSection/DishRecipeSection';
import { SectionLabel } from '../SectionLabel/SectionLabel';

type Props = {
	// The note field, so the row can focus it when the note chip opens the panel.
	noteRef: Ref<HTMLTextAreaElement>;
};

// A dish's expand panel: its recipe and its note, side by side on desktop and stacked on a phone.
export const DishPanel = ({ noteRef }: Props) => {
	const { dish, setNote } = useDish();

	return (
		<SimpleGrid cols={{ base: 1, sm: 2 }} className={classes.root}>
			<DishRecipeSection />
			<Stack gap={6}>
				<SectionLabel>Note</SectionLabel>
				<Textarea
					ref={noteRef}
					aria-label="Note"
					placeholder="Prep reminders, swaps, what to buy…"
					autosize
					minRows={3}
					value={dish.note}
					onChange={(e) => setNote(dish.key, e.currentTarget.value)}
				/>
			</Stack>
		</SimpleGrid>
	);
};
