'use client';

import { Button, Group, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import { useIsMobile } from '@/_hooks';

import { formatDishCount } from '../../_utils/formatDishCount';
import type { DishDraft } from '../../types';
import { DishRow } from '../DishRow/DishRow';
import { SectionLabel } from '../SectionLabel/SectionLabel';

type Props = {
	dishes: DishDraft[];
	onAddDish: () => void;
	onRenameDish: (key: string, name: string) => void;
	onRemoveDish: (key: string) => void;
	onUnlinkDish: (key: string) => void;
	onSetReference: (key: string, text: string) => void;
	onSetNote: (key: string, note: string) => void;
};

// DISHES with its count, a row for each dish, then Add dish.
export const DishList = ({
	dishes,
	onAddDish,
	onRenameDish,
	onRemoveDish,
	onUnlinkDish,
	onSetReference,
	onSetNote,
}: Props) => {
	const isMobile = useIsMobile();

	return (
		<Stack gap="xs">
			{/* A phone puts the count at the far end of the line, as its narrow column has room for nothing else there. */}
			<Group gap="xs" justify={isMobile ? 'space-between' : 'flex-start'}>
				<SectionLabel>Dishes</SectionLabel>
				<Text size="xs" c="var(--text-muted)">
					{formatDishCount(dishes.length)}
				</Text>
			</Group>
			{dishes.map((dish) => (
				<DishRow
					key={dish.key}
					dish={dish}
					canDelete={dishes.length > 1}
					onRename={(name) => onRenameDish(dish.key, name)}
					onDelete={() => onRemoveDish(dish.key)}
					onUnlink={() => onUnlinkDish(dish.key)}
					onReferenceChange={(text) => onSetReference(dish.key, text)}
					onNoteChange={(note) => onSetNote(dish.key, note)}
				/>
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
