'use client';

import type { Ref } from 'react';

import { SimpleGrid, Stack, Textarea } from '@mantine/core';

import classes from './DishPanel.module.css';

import type { DishDraft } from '../../types';
import { DishRecipeSection } from '../DishRecipeSection/DishRecipeSection';
import { SectionLabel } from '../SectionLabel/SectionLabel';

type Props = {
	dish: DishDraft;
	// The note field, so the row can focus it when the note chip opens the panel.
	noteRef: Ref<HTMLTextAreaElement>;
	onUnlink: () => void;
	onReferenceChange: (text: string) => void;
	onNoteChange: (note: string) => void;
};

// A dish's expand panel: its recipe and its note, side by side on desktop and stacked on a phone.
export const DishPanel = ({
	dish,
	noteRef,
	onUnlink,
	onReferenceChange,
	onNoteChange,
}: Props) => (
	<SimpleGrid cols={{ base: 1, sm: 2 }} className={classes.root}>
		<DishRecipeSection
			source={dish.source}
			onUnlink={onUnlink}
			onReferenceChange={onReferenceChange}
		/>
		<Stack gap={6}>
			<SectionLabel>Note</SectionLabel>
			<Textarea
				ref={noteRef}
				aria-label="Note"
				placeholder="Prep reminders, swaps, what to buy…"
				autosize
				minRows={3}
				value={dish.note}
				onChange={(e) => onNoteChange(e.currentTarget.value)}
			/>
		</Stack>
	</SimpleGrid>
);
