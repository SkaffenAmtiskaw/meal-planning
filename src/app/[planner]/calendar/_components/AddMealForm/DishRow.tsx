'use client';

import {
	ActionIcon,
	Box,
	Collapse,
	Flex,
	Group,
	TextInput,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconTrash } from '@tabler/icons-react';

import { useIsMobile } from '@/_hooks';

import { DishRowExpanded } from './DishRowExpanded';
import { DishSourceChip } from './DishSourceChip';
import type { DishState } from './types';
import classes from './DishRow.module.css';

import { usePlannerSavedItems } from '../../_hooks/usePlannerSavedItems';
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
	expandButton: React.ReactNode;
	removeButton: React.ReactNode | null;
};

export const DishRowLayout = ({
	index,
	nameInput,
	chip,
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

	const toggleExpanded = () => onUpdate({ expanded: !dish.expanded });

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
			onClick={toggleExpanded}
			data-testid={`dish-source-chip-${index}`}
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
				expandButton={expandButton}
				removeButton={removeButton}
			/>

			<Collapse expanded={dish.expanded}>
				<DishRowExpanded dish={dish} index={index} onUpdate={onUpdate} />
			</Collapse>
		</Box>
	);
};
