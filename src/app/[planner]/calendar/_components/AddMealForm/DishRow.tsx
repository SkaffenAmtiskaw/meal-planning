'use client';

import {
	ActionIcon,
	Box,
	Collapse,
	Flex,
	Group,
	Text,
	TextInput,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconTrash } from '@tabler/icons-react';

import { useIsMobile } from '@/_hooks';

import { DishNoteChip } from './DishNoteChip';
import { DishRowExpanded } from './DishRowExpanded';
import { DishSourceChip } from './DishSourceChip';
import type { DishState } from './types';
import classes from './DishRow.module.css';

import { usePlannerSavedItems } from '../../_hooks/usePlannerSavedItems';
import { useFocusOnExpand } from './_hooks/useFocusOnExpand';
import { formatSourceChip } from './_utils/formatSourceChip';

type Props = {
	dish: DishState;
	index: number;
	showRemove: boolean;
	onUpdate: (patch: Partial<DishState>) => void;
	onRemove: () => void;
};

type DishRowLayoutProps = {
	index: number;
	nameInput: React.ReactNode;
	chip: React.ReactNode;
	noteChip: React.ReactNode;
	expandButton: React.ReactNode;
	removeButton: React.ReactNode | null;
};

export const DishRowLayout = ({
	index,
	nameInput,
	chip,
	noteChip,
	expandButton,
	removeButton,
}: DishRowLayoutProps) => {
	const isMobile = useIsMobile();

	if (isMobile) {
		return (
			<Flex
				className={`${classes.rowLayout} ${classes.rowLayoutMobile}`}
				data-testid={`dish-row-layout-${index}`}
				direction="column"
				gap="xs"
			>
				{nameInput}
				<Group gap="xs">
					{chip}
					{noteChip}
					{expandButton}
					{removeButton}
				</Group>
			</Flex>
		);
	}

	return (
		<Flex
			className={classes.rowLayout}
			data-testid={`dish-row-layout-${index}`}
			gap="xs"
			align="center"
		>
			{nameInput}
			<Group gap="xs">
				{chip}
				{noteChip}
				{expandButton}
				{removeButton}
			</Group>
		</Flex>
	);
};

const deriveSourceChipProps = (
	dish: DishState,
	savedItems: ReturnType<typeof usePlannerSavedItems>,
): { label: string; title?: string; isEmpty: boolean } => {
	if (dish.sourceType === 'none') {
		return { label: 'Add source', isEmpty: true };
	}

	if (dish.sourceType === 'saved') {
		const savedItem = savedItems.find((item) => item._id === dish.savedId);
		if (savedItem) {
			return {
				label: savedItem.name,
				title: savedItem.name,
				isEmpty: false,
			};
		}
		return { label: 'Choose a saved item', isEmpty: true };
	}

	if (dish.sourceText === '') {
		return { label: 'Add reference', isEmpty: true };
	}

	return {
		label: formatSourceChip(dish.sourceText),
		title: dish.sourceText,
		isEmpty: false,
	};
};

export const DishRow = ({
	dish,
	index,
	showRemove,
	onUpdate,
	onRemove,
}: Props) => {
	const savedItems = usePlannerSavedItems();
	const { ref: noteRef, requestFocus: requestNoteFocus } =
		useFocusOnExpand<HTMLTextAreaElement>(dish.expanded);

	const toggleExpanded = () => onUpdate({ expanded: !dish.expanded });
	const expandSource = () => {
		if (!dish.expanded) {
			onUpdate({ expanded: true });
		}
	};
	const expandNote = () => {
		if (!dish.expanded) {
			requestNoteFocus();
			onUpdate({ expanded: true });
		}
	};

	const { label, title, isEmpty } = deriveSourceChipProps(dish, savedItems);

	const nameInput = (
		<TextInput
			aria-label="Dish name"
			placeholder="Dish name"
			className={classes.nameInput}
			size="sm"
			data-testid={`dish-name-${index}`}
			value={dish.name}
			onChange={(e) => onUpdate({ name: e.currentTarget.value })}
		/>
	);

	const chip = (
		<DishSourceChip
			label={label}
			title={title}
			sourceType={dish.sourceType}
			isEmpty={isEmpty}
			onClick={expandSource}
			data-testid={`dish-source-chip-${index}`}
		/>
	);

	const noteChip = (
		<DishNoteChip
			note={dish.note}
			onClick={expandNote}
			data-testid={`dish-note-chip-${index}`}
		/>
	);

	const expandButton = (
		<ActionIcon
			variant="subtle"
			size="input-sm"
			data-testid={`dish-expand-${index}`}
			aria-label={dish.expanded ? 'Collapse dish' : 'Expand dish'}
			onClick={toggleExpanded}
			className={classes.expandButton}
		>
			{dish.expanded ? <IconChevronUp /> : <IconChevronDown />}
		</ActionIcon>
	);

	const removeButton = showRemove ? (
		<ActionIcon
			variant="subtle"
			color="red"
			size="input-sm"
			data-testid={`dish-remove-${index}`}
			aria-label="Remove dish"
			onClick={onRemove}
			className={classes.removeButton}
		>
			<IconTrash />
		</ActionIcon>
	) : null;

	return (
		<Box
			data-testid={`dish-row-${index}`}
			className={
				dish.expanded ? `${classes.root} ${classes.expanded}` : classes.root
			}
		>
			<DishRowLayout
				index={index}
				nameInput={nameInput}
				chip={chip}
				noteChip={noteChip}
				expandButton={expandButton}
				removeButton={removeButton}
			/>

			{dish.note !== '' && !dish.expanded && (
				<Text
					data-testid={`dish-note-text-${index}`}
					title={dish.note}
					truncate="end"
					c="navy.4"
					mt="xs"
					size="sm"
				>
					{dish.note}
				</Text>
			)}

			<Collapse expanded={dish.expanded}>
				<DishRowExpanded
					ref={noteRef}
					dish={dish}
					index={index}
					onUpdate={onUpdate}
				/>
			</Collapse>
		</Box>
	);
};
