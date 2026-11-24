'use client';

import { useState } from 'react';

import { ActionIcon, Collapse, Group, Paper, Text } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

import { useFocusOnExpand } from '@/_hooks';

import classes from './DishRow.module.css';

import type { DishDraft } from '../../types';
import { DeleteDishButton } from '../DeleteDishButton/DeleteDishButton';
import { DishNameInput } from '../DishNameInput/DishNameInput';
import { DishPanel } from '../DishPanel/DishPanel';
import { NoteChip } from '../NoteChip/NoteChip';
import { RecipeChip } from '../RecipeChip/RecipeChip';

type Props = {
	dish: DishDraft;
	canDelete: boolean;
	onRename: (name: string) => void;
	onDelete: () => void;
	onUnlink: () => void;
	onReferenceChange: (text: string) => void;
	onNoteChange: (note: string) => void;
};

/**
 * One dish: its name, recipe chip, note chip, expand arrow and delete, then its
 * panel. Whether the panel is open isn't part of the draft, so each row keeps
 * its own, and several can be open at once. A closed row shows its note under it.
 */
export const DishRow = ({
	dish,
	canDelete,
	onRename,
	onDelete,
	onUnlink,
	onReferenceChange,
	onNoteChange,
}: Props) => {
	const [open, setOpen] = useState(false);
	const { ref: noteRef, requestFocus: focusNote } =
		useFocusOnExpand<HTMLTextAreaElement>(open);

	const togglePanel = () => setOpen((wasOpen) => !wasOpen);
	// Opening the panel from the note chip puts the cursor in the note.
	const toggleFromNote = () => {
		if (!open) {
			focusNote();
		}
		togglePanel();
	};

	return (
		<Paper withBorder p="xs" data-testid="dish-row">
			<div className={classes.line}>
				<div className={classes.name}>
					<DishNameInput name={dish.name} onRename={onRename} />
				</div>
				<Group gap="xs" wrap="nowrap" className={classes.chips}>
					<RecipeChip source={dish.source} onTogglePanel={togglePanel} />
					<NoteChip hasNote={dish.note !== ''} onTogglePanel={toggleFromNote} />
				</Group>
				<ActionIcon
					variant="subtle"
					size="input-sm"
					className={classes.arrow}
					aria-label={open ? 'Collapse dish' : 'Expand dish'}
					aria-expanded={open}
					onClick={togglePanel}
				>
					{open ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
				</ActionIcon>
				{canDelete && (
					<div className={classes.delete}>
						<DeleteDishButton dishName={dish.name} onDelete={onDelete} />
					</div>
				)}
			</div>
			{!open && dish.note !== '' && (
				<Text size="sm" c="var(--text-muted)" className={classes.note}>
					{dish.note}
				</Text>
			)}
			<Collapse expanded={open}>
				<DishPanel
					dish={dish}
					noteRef={noteRef}
					onUnlink={onUnlink}
					onReferenceChange={onReferenceChange}
					onNoteChange={onNoteChange}
				/>
			</Collapse>
		</Paper>
	);
};
