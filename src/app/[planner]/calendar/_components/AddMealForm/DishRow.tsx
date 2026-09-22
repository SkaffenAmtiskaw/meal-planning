'use client';

import { ActionIcon, Box, Collapse, Group, TextInput } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconTrash } from '@tabler/icons-react';

import { DishRowExpanded } from './DishRowExpanded';
import type { DishState } from './types';
import classes from './DishRow.module.css';

type Props = {
	dish: DishState;
	index: number;
	showRemove: boolean;
	onUpdate: (patch: Partial<DishState>) => void;
	onRemove: () => void;
};

export const DishRow = ({
	dish,
	index,
	showRemove,
	onUpdate,
	onRemove,
}: Props) => {
	return (
		<Box
			data-testid={`dish-row-${index}`}
			className={
				dish.expanded ? `${classes.root} ${classes.expanded}` : classes.root
			}
		>
			<Group align="center" gap={8}>
				<TextInput
					aria-label="Dish name"
					placeholder="Dish name"
					className={classes.nameInput}
					size="sm"
					data-testid={`dish-name-${index}`}
					value={dish.name}
					onChange={(e) => onUpdate({ name: e.currentTarget.value })}
				/>
				<ActionIcon
					variant="subtle"
					size="input-sm"
					data-testid={`dish-expand-${index}`}
					aria-label={dish.expanded ? 'Collapse dish' : 'Expand dish'}
					onClick={() => onUpdate({ expanded: !dish.expanded })}
					className={classes.expandButton}
				>
					{dish.expanded ? <IconChevronUp /> : <IconChevronDown />}
				</ActionIcon>
				{showRemove && (
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
				)}
			</Group>

			<Collapse expanded={dish.expanded}>
				<DishRowExpanded dish={dish} index={index} onUpdate={onUpdate} />
			</Collapse>
		</Box>
	);
};
