'use client';

import { Button, Group, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import { useIsMobile } from '@/_hooks';

import { useMealDishes } from '../../../_hooks/useMealForm';
import { DishProvider } from '../../_hooks/useDish';
import { formatDishCount } from '../../_utils/formatDishCount';
import { DishRow } from '../DishRow/DishRow';
import { SectionLabel } from '../SectionLabel/SectionLabel';

type Props = {
	onAddDish: () => void;
};

// DISHES with its count, a row for each dish, then Add dish.
export const DishList = ({ onAddDish }: Props) => {
	const { dishes, dishCount } = useMealDishes();
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
			{dishes.map((dish, index) => (
				<DishProvider key={dish.key} dish={dish} index={index}>
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
