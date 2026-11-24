'use client';

import { Group, Paper } from '@mantine/core';

import type { DishDraft } from '../../types';
import { DeleteDishButton } from '../DeleteDishButton/DeleteDishButton';
import { DishNameInput } from '../DishNameInput/DishNameInput';

type Props = {
	dish: DishDraft;
	canDelete: boolean;
	onRename: (name: string) => void;
	onDelete: () => void;
};

// One dish: its name, then its delete button unless it's the meal's last dish.
export const DishRow = ({ dish, canDelete, onRename, onDelete }: Props) => (
	<Paper withBorder p="xs" data-testid="dish-row">
		<Group gap="xs" wrap="nowrap">
			<DishNameInput name={dish.name} onRename={onRename} />
			{canDelete && (
				<DeleteDishButton dishName={dish.name} onDelete={onDelete} />
			)}
		</Group>
	</Paper>
);
