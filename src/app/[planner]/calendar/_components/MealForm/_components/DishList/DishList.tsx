'use client';

import { Button, Group, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import { useIsMobile } from '@/_hooks';

import { DishProvider } from '../../_hooks/useDish';
import { formatDishCount } from '../../_utils/formatDishCount';
import type { DishDraft } from '../../types';
import { DishRow } from '../DishRow/DishRow';
import { SectionLabel } from '../SectionLabel/SectionLabel';

type Props = {
	dishes: DishDraft[];
	// How many dishes will be saved, so blank rows aren't counted.
	dishCount: number;
	onAddDish: () => void;
};

// DISHES with its count, a row for each dish, then Add dish.
export const DishList = ({ dishes, dishCount, onAddDish }: Props) => {
	const isMobile = useIsMobile();

	return (
		<Stack gap="xs">
			{/* A phone puts the count at the far end of the line, as its narrow column has room for nothing else there. */}
			<Group gap="xs" justify={isMobile ? 'space-between' : 'flex-start'}>
				<SectionLabel>Dishes</SectionLabel>
				<Text size="xs" c="var(--text-muted)">
					{formatDishCount(dishCount)}
				</Text>
			</Group>
			{dishes.map((dish) => (
				<DishProvider key={dish.key} dish={dish}>
					<DishRow canDelete={dishes.length > 1} />
				</DishProvider>
			))}
			<Button
				variant="dashed"
				size="md"
				fullWidth
				leftSection={<IconPlus size={16} />}
				onClick={onAddDish}
			>
				Add dish
			</Button>
		</Stack>
	);
};
