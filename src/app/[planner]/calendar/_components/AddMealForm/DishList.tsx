'use client';

import { Button, Group, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import { DishRow } from './DishRow';
import type { DishState } from './types';
import classes from './DishList.module.css';

type DishListProps = {
	dishes: DishState[];
	onAddDish: () => void;
	onRemoveDish: (id: string) => void;
	onUpdateDish: (id: string, patch: Partial<DishState>) => void;
};

export const DishList = ({
	dishes,
	onAddDish,
	onRemoveDish,
	onUpdateDish,
}: DishListProps) => {
	const countLabel = dishes.length === 1 ? '1 dish' : `${dishes.length} dishes`;

	return (
		<Stack gap={8}>
			<Group justify="space-between" align="center">
				<Group gap="xs">
					<Text className={classes.title}>DISHES</Text>
					<Text className={classes.count}>{countLabel}</Text>
				</Group>

				<Button
					variant="outline"
					size="sm"
					leftSection={<IconPlus size={14} />}
					onClick={onAddDish}
					className={classes.addButton}
				>
					Add dish
				</Button>
			</Group>

			{dishes.map((dish, index) => (
				<DishRow
					key={dish.id}
					dish={dish}
					index={index}
					showRemove={dishes.length > 1}
					onUpdate={(patch) => onUpdateDish(dish.id, patch)}
					onRemove={() => onRemoveDish(dish.id)}
				/>
			))}

			<Button
				variant="subtle"
				fullWidth
				leftSection={<IconPlus size={16} />}
				onClick={onAddDish}
				className={classes.addAnother}
			>
				Add another dish
			</Button>
		</Stack>
	);
};
