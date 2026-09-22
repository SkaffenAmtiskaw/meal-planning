'use client';

import { Button, Card, Group, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import { DishRow } from './DishRow';
import type { DishState } from './types';

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
		<Card p="sm" withBorder>
			<Stack gap="xs">
				<Group justify="space-between" align="center">
					<Group gap="xs">
						<Text fw={500} size="sm" c="dimmed">
							DISHES
						</Text>
						<Text size="sm" c="dimmed">
							{countLabel}
						</Text>
					</Group>

					<Button
						variant="subtle"
						size="compact-sm"
						leftSection={<IconPlus size={14} />}
						onClick={onAddDish}
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
					leftSection={<IconPlus size={14} />}
					onClick={onAddDish}
				>
					Add another dish
				</Button>
			</Stack>
		</Card>
	);
};
