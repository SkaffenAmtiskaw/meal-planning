'use client';

import { useState } from 'react';

import { ActionIcon, Collapse, Group, Paper, Text } from '@mantine/core';
import {
	IconAlertCircle,
	IconChevronDown,
	IconChevronUp,
} from '@tabler/icons-react';

import clsx from 'clsx';

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
	// True once a save was stopped because this dish has something in it but no name.
	nameless?: boolean;
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
	nameless = false,
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
		<Paper
			withBorder
			p="xs"
			className={clsx(nameless && classes.nameless)}
			data-testid="dish-row"
		>
			<div className={classes.line}>
				<div className={classes.name}>
					<DishNameInput
						name={dish.name}
						error={nameless}
						onRename={onRename}
					/>
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
			{nameless && (
				<Group gap={6} mt="xs" wrap="nowrap" role="alert">
					<IconAlertCircle
						size={14}
						color="var(--mantine-color-error)"
						aria-hidden
					/>
					<Text size="sm" fw={500} c="var(--mantine-color-error)">
						Name this dish, or delete it.
					</Text>
				</Group>
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
