'use client';

import { useState } from 'react';

import { ActionIcon, Collapse, Group, Paper, Text } from '@mantine/core';
import {
	IconAlertCircle,
	IconChevronDown,
	IconChevronUp,
} from '@tabler/icons-react';

import clsx from 'clsx';

import { useFocusOnExpand, useIsMobile } from '@/_hooks';

import classes from './DishRow.module.css';

import { usePlannerSavedItems } from '../../../../_hooks/usePlannerSavedItems';
import { useDish } from '../../_hooks/useDish';
import { DeleteDishButton } from '../DeleteDishButton/DeleteDishButton';
import { DishNameInput } from '../DishNameInput/DishNameInput';
import { DishNameSearch } from '../DishNameSearch/DishNameSearch';
import { DishPanel } from '../DishPanel/DishPanel';
import { NoteChip } from '../NoteChip/NoteChip';
import { PhoneSavedList } from '../PhoneSavedList/PhoneSavedList';
import { RecipeChip } from '../RecipeChip/RecipeChip';

type Props = {
	canDelete: boolean;
};

/**
 * One dish: its name, recipe chip, note chip, expand arrow and delete, then its
 * panel. Whether the panel is open isn't part of the draft, so each row keeps
 * its own, and several can be open at once. A closed row shows its note under it.
 * On a phone, the name field searches saved recipes, and while its list is open
 * the list takes the chips' line, as the design shows. The dish and the form's
 * actions on it come from useDish().
 */
export const DishRow = ({ canDelete }: Props) => {
	const { dish, nameless, linking, listOpenId } = useDish();
	const isMobile = useIsMobile();
	const savedItems = usePlannerSavedItems();
	const [open, setOpen] = useState(false);
	// The name's area, where a tap leaves the phone list open.
	const [nameNode, setNameNode] = useState<HTMLDivElement | null>(null);
	const listOpen = listOpenId !== null;
	/**
	 * In a planner with no saved recipes, an open list stays hidden until
	 * something is typed, and the row keeps its chips until then.
	 */
	const showList =
		isMobile && listOpen && (savedItems.length > 0 || dish.name.trim() !== '');
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
			className={clsx(
				classes.row,
				linking && classes.linking,
				nameless && classes.nameless,
				showList && classes.listOpen,
			)}
			data-testid="dish-row"
		>
			<div className={classes.line}>
				<div className={classes.name} ref={setNameNode}>
					{isMobile ? <DishNameSearch /> : <DishNameInput />}
				</div>
				{!showList && (
					<>
						<Group gap="xs" wrap="nowrap" className={classes.chips}>
							<RecipeChip onTogglePanel={togglePanel} />
							<NoteChip
								hasNote={dish.note !== ''}
								onTogglePanel={toggleFromNote}
							/>
						</Group>
						<ActionIcon
							variant="subtle"
							size="input-sm"
							className={classes.arrow}
							aria-label={open ? 'Collapse dish' : 'Expand dish'}
							aria-expanded={open}
							onClick={togglePanel}
						>
							{open ? (
								<IconChevronUp size={18} />
							) : (
								<IconChevronDown size={18} />
							)}
						</ActionIcon>
					</>
				)}
				{canDelete && (
					<div className={classes.delete}>
						<DeleteDishButton />
					</div>
				)}
			</div>
			{/* Keyed on the open, so each new open starts the list afresh. */}
			{showList && <PhoneSavedList key={listOpenId} fieldNode={nameNode} />}
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
				<DishPanel noteRef={noteRef} />
			</Collapse>
		</Paper>
	);
};
